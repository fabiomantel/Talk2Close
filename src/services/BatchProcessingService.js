/**
 * Batch Processing Service
 * Orchestrates multi-file processing workflow using interface-based architecture
 */

const { prisma } = require('../database/connection');
const providerFactory = require('./ProviderFactory');
const ConfigurationValidator = require('./ConfigurationValidator');
const whisperService = require('./whisperService');
const scoringService = require('./scoringService');
const enhancedScoringService = require('./enhancedScoringService');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class BatchProcessingService {
  constructor() {
    this.validator = new ConfigurationValidator();
    this.activeJobs = new Map();
    this.processingQueue = [];
    this.isProcessing = false;
  }

  /**
   * Start batch processing for a folder
   * @param {number} folderId - External folder ID
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Batch job result
   */
  async startBatchProcessing(folderId, options = {}) {
    try {
      console.log(`🚀 Starting batch processing for folder ID: ${folderId}`);

      // Get folder configuration
      const folder = await prisma.externalFolder.findUnique({
        where: { id: folderId }
      });

      if (!folder) {
        throw new Error(`External folder with ID ${folderId} not found`);
      }

      if (!folder.isActive) {
        throw new Error(`External folder ${folder.name} is not active`);
      }

      // Validate folder configuration
      const validation = this.validator.validateFolderConfig(folder);
      if (!validation.valid) {
        throw new Error(`Invalid folder configuration: ${validation.errors.join(', ')}`);
      }

      // Create batch job
      const batchJob = await prisma.batchJob.create({
        data: {
          folderId: folderId,
          name: `Batch Job - ${folder.name} - ${new Date().toISOString()}`,
          status: 'pending',
          totalFiles: 0,
          processedFiles: 0,
          failedFiles: 0,
          skippedFiles: 0
        }
      });

      console.log(`📋 Created batch job ID: ${batchJob.id}`);

      // Create providers
      const storageProvider = await providerFactory.createStorageProvider(
        folder.storageConfig.type,
        folder.storageConfig.config
      );

      const monitorProvider = await providerFactory.createMonitorProvider(
        folder.monitorConfig.type,
        folder.monitorConfig.config
      );

      // Get notification providers
      const notificationConfigs = await prisma.notificationConfig.findMany({
        where: { isActive: true }
      });

      const notificationProviders = await providerFactory.createNotificationProviders(
        notificationConfigs.map(config => ({
          type: config.type,
          config: config.config,
          enabled: config.isActive
        }))
      );

      // Start monitoring
      const monitorHandle = await monitorProvider.startMonitoring(folder.monitorConfig.config);

      // Store job information
      this.activeJobs.set(batchJob.id, {
        batchJob,
        folder,
        storageProvider,
        monitorProvider,
        monitorHandle,
        notificationProviders,
        options
      });

      // Start processing
      await this.processBatchJob(batchJob.id);

      return {
        success: true,
        batchJobId: batchJob.id,
        message: 'Batch processing started successfully'
      };

    } catch (error) {
      console.error(`❌ Failed to start batch processing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a batch job
   * @param {number} batchJobId - Batch job ID
   */
  async processBatchJob(batchJobId) {
    const jobInfo = this.activeJobs.get(batchJobId);
    if (!jobInfo) {
      throw new Error(`Batch job ${batchJobId} not found`);
    }

    const { batchJob, folder, storageProvider, monitorProvider, notificationProviders } = jobInfo;

    try {
      console.log(`🔄 Processing batch job ID: ${batchJobId}`);

      // Update job status to running
      await prisma.batchJob.update({
        where: { id: batchJobId },
        data: {
          status: 'running',
          startedAt: new Date()
        }
      });

      // Scan for files
      const files = await monitorProvider.scanForFiles(folder.monitorConfig.config);
      console.log(`📁 Found ${files.length} files to process`);

      // Update total files count
      await prisma.batchJob.update({
        where: { id: batchJobId },
        data: { totalFiles: files.length }
      });

      // Create file processing records
      const fileRecords = [];
      for (const file of files) {
        const fileRecord = await prisma.fileProcessingRecord.create({
          data: {
            batchJobId: batchJobId,
            fileName: file.name,
            filePath: file.path,
            fileSize: file.size,
            status: 'discovered'
          }
        });
        fileRecords.push(fileRecord);
      }

      // Process files
      await this.processFiles(batchJobId, fileRecords, storageProvider, folder, notificationProviders);

      // Update job status to completed
      await prisma.batchJob.update({
        where: { id: batchJobId },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });

      // Send completion notification
      await this.sendNotification(notificationProviders, 'batch_completed', {
        batchJobId,
        folderName: folder.name,
        totalFiles: files.length
      });

      console.log(`✅ Batch job ${batchJobId} completed successfully`);

    } catch (error) {
      console.error(`❌ Batch job ${batchJobId} failed: ${error.message}`);

      // Update job status to failed
      await prisma.batchJob.update({
        where: { id: batchJobId },
        data: {
          status: 'failed',
          completedAt: new Date()
        }
      });

      // Send failure notification
      await this.sendNotification(notificationProviders, 'batch_failed', {
        batchJobId,
        folderName: folder.name,
        error: error.message
      });

      throw error;
    } finally {
      // Clean up
      this.activeJobs.delete(batchJobId);
    }
  }

  /**
   * Process individual files
   * @param {number} batchJobId - Batch job ID
   * @param {Array} fileRecords - File processing records
   * @param {IStorageProvider} storageProvider - Storage provider
   * @param {Object} folder - Folder configuration
   * @param {Array} notificationProviders - Notification providers
   */
  async processFiles(batchJobId, fileRecords, storageProvider, folder, notificationProviders) {
    const processingConfig = folder.processingConfig;
    const maxConcurrent = processingConfig.maxConcurrentFiles || 5;

    console.log(`📦 Processing ${fileRecords.length} files with max concurrency: ${maxConcurrent}`);

    // Process files in batches
    for (let i = 0; i < fileRecords.length; i += maxConcurrent) {
      const batch = fileRecords.slice(i, i + maxConcurrent);
      const promises = batch.map(fileRecord => 
        this.processFile(fileRecord, storageProvider, folder, notificationProviders)
      );

      await Promise.allSettled(promises);

      // Update batch job progress
      const stats = await this.getBatchJobStats(batchJobId);
      await prisma.batchJob.update({
        where: { id: batchJobId },
        data: {
          processedFiles: stats.processedFiles,
          failedFiles: stats.failedFiles,
          skippedFiles: stats.skippedFiles
        }
      });
    }
  }

  /**
   * Process a single file
   * @param {Object} fileRecord - File processing record
   * @param {IStorageProvider} storageProvider - Storage provider
   * @param {Object} folder - Folder configuration
   * @param {Array} notificationProviders - Notification providers
   */
  async processFile(fileRecord, storageProvider, folder, notificationProviders) {
    try {
      console.log(`📄 Processing file: ${fileRecord.fileName}`);

      // Update status to processing
      await prisma.fileProcessingRecord.update({
        where: { id: fileRecord.id },
        data: {
          status: 'processing',
          processingStartedAt: new Date()
        }
      });

      // Validate file
      const validation = await this.validateFile(fileRecord, folder.processingConfig);
      if (!validation.valid) {
        await this.markFileSkipped(fileRecord.id, validation.errorCode, validation.errorMessage);
        return;
      }

      // Download file
      const localPath = path.join(process.env.UPLOAD_DIR || './uploads', `${uuidv4()}.${this.getFileExtension(fileRecord.fileName)}`);
      await storageProvider.downloadFile(fileRecord.filePath, localPath);

      // Process file using existing pipeline
      const customer = await this.createCustomerFromFileName(fileRecord.fileName);
      const salesCall = await this.createSalesCall(customer.id, localPath);

      // Update file record with sales call ID
      await prisma.fileProcessingRecord.update({
        where: { id: fileRecord.id },
        data: { salesCallId: salesCall.id }
      });

      // Process audio (using existing services)
      await this.processAudioFile(salesCall.id, localPath);

      // Mark as completed
      await prisma.fileProcessingRecord.update({
        where: { id: fileRecord.id },
        data: {
          status: 'completed',
          processingCompletedAt: new Date()
        }
      });

      console.log(`✅ File processed successfully: ${fileRecord.fileName}`);

      // Send file processed notification
      await this.sendNotification(notificationProviders, 'file_processed', {
        fileName: fileRecord.fileName,
        salesCallId: salesCall.id
      });

    } catch (error) {
      console.error(`❌ File processing failed: ${fileRecord.fileName} - ${error.message}`);

      await this.handleFileProcessingError(fileRecord.id, error, folder.processingConfig, notificationProviders);
    }
  }

  /**
   * Validate file before processing
   * @param {Object} fileRecord - File processing record
   * @param {Object} processingConfig - Processing configuration
   * @returns {Object} - Validation result
   */
  async validateFile(fileRecord, processingConfig) {
    // Check file size
    if (processingConfig.maxFileSize && fileRecord.fileSize > processingConfig.maxFileSize) {
      return {
        valid: false,
        errorCode: 'FILE_TOO_LARGE',
        errorMessage: `File size ${fileRecord.fileSize} exceeds limit ${processingConfig.maxFileSize}`
      };
    }

    // Check file extension
    const extension = this.getFileExtension(fileRecord.fileName);
    const allowedExtensions = processingConfig.allowedExtensions || ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
    if (!allowedExtensions.includes(`.${extension.toLowerCase()}`)) {
      return {
        valid: false,
        errorCode: 'INVALID_FORMAT',
        errorMessage: `File extension .${extension} is not allowed`
      };
    }

    // Check file name format (UUID)
    if (!this.validator.validateFileNameFormat(fileRecord.fileName)) {
      return {
        valid: false,
        errorCode: 'INVALID_FILENAME',
        errorMessage: 'File name must be in UUID format'
      };
    }

    return { valid: true };
  }

  /**
   * Mark file as skipped
   * @param {number} fileRecordId - File record ID
   * @param {string} errorCode - Error code
   * @param {string} errorMessage - Error message
   */
  async markFileSkipped(fileRecordId, errorCode, errorMessage) {
    await prisma.fileProcessingRecord.update({
      where: { id: fileRecordId },
      data: {
        status: 'skipped',
        errorCode,
        errorMessage,
        processingCompletedAt: new Date()
      }
    });
  }

  /**
   * Handle file processing error
   * @param {number} fileRecordId - File record ID
   * @param {Error} error - Error object
   * @param {Object} processingConfig - Processing configuration
   * @param {Array} notificationProviders - Notification providers
   */
  async handleFileProcessingError(fileRecordId, error, processingConfig, notificationProviders) {
    const fileRecord = await prisma.fileProcessingRecord.findUnique({
      where: { id: fileRecordId }
    });

    const retryConfig = processingConfig.retryConfig || {};
    const maxRetries = retryConfig.maxRetries || 3;
    const currentRetries = fileRecord.retryCount;

    if (currentRetries < maxRetries && retryConfig.enabled !== false) {
      // Retry processing
      await prisma.fileProcessingRecord.update({
        where: { id: fileRecordId },
        data: {
          status: 'retrying',
          retryCount: currentRetries + 1,
          errorCode: 'PROCESSING_ERROR',
          errorMessage: error.message,
          errorDetails: { stack: error.stack }
        }
      });

      // Schedule retry with exponential backoff
      const delay = retryConfig.exponentialBackoff ? 
        (retryConfig.delaySeconds || 60) * Math.pow(2, currentRetries) :
        (retryConfig.delaySeconds || 60);

      setTimeout(() => {
        this.retryFileProcessing(fileRecordId);
      }, delay * 1000);

    } else {
      // Mark as failed
      await prisma.fileProcessingRecord.update({
        where: { id: fileRecordId },
        data: {
          status: 'failed',
          errorCode: 'MAX_RETRIES_EXCEEDED',
          errorMessage: `Failed after ${maxRetries} retries: ${error.message}`,
          errorDetails: { stack: error.stack },
          processingCompletedAt: new Date()
        }
      });

      // Send failure notification
      await this.sendNotification(notificationProviders, 'file_failed', {
        fileName: fileRecord.fileName,
        error: error.message
      });
    }
  }

  /**
   * Retry file processing
   * @param {number} fileRecordId - File record ID
   */
  async retryFileProcessing(fileRecordId) {
    // Implementation for retrying file processing
    console.log(`🔄 Retrying file processing for record ID: ${fileRecordId}`);
    // This would re-queue the file for processing
  }

  /**
   * Create customer from file name (UUID)
   * @param {string} fileName - File name
   * @returns {Object} - Customer object
   */
  async createCustomerFromFileName(fileName) {
    const uuid = fileName.split('.')[0];
    
    // Check if customer already exists
    let customer = await prisma.customer.findFirst({
      where: { name: `Customer-${uuid}` }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: `Customer-${uuid}`,
          phone: `Generated-${uuid.substring(0, 8)}`,
          email: `${uuid}@generated.local`
        }
      });
    }

    return customer;
  }

  /**
   * Create sales call record
   * @param {number} customerId - Customer ID
   * @param {string} audioFilePath - Audio file path
   * @returns {Object} - Sales call object
   */
  async createSalesCall(customerId, audioFilePath) {
    return await prisma.salesCall.create({
      data: {
        customerId,
        audioFilePath
      }
    });
  }

  /**
   * Process audio file using existing pipeline
   * @param {number} salesCallId - Sales call ID
   * @param {string} audioFilePath - Audio file path
   */
  async processAudioFile(salesCallId, audioFilePath) {
    // Use existing whisper service
    const transcription = await whisperService.transcribeAudio(audioFilePath);
    
    // Use existing scoring service
    const scores = scoringService.analyzeTranscript(transcription.text);
    
    // Update sales call with results
    await prisma.salesCall.update({
      where: { id: salesCallId },
      data: {
        transcript: transcription.text,
        urgencyScore: scores.urgency,
        budgetScore: scores.budget,
        interestScore: scores.interest,
        engagementScore: scores.engagement,
        overallScore: scores.overall,
        analysisNotes: scores.analysisNotes
      }
    });
  }

  /**
   * Send notification
   * @param {Array} providers - Notification providers
   * @param {string} condition - Notification condition
   * @param {Object} data - Notification data
   */
  async sendNotification(providers, condition, data) {
    for (const provider of providers) {
      try {
        await provider.sendNotification({
          condition,
          data,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`❌ Failed to send notification via ${provider.getType()}: ${error.message}`);
      }
    }
  }

  /**
   * Get batch job statistics
   * @param {number} batchJobId - Batch job ID
   * @returns {Object} - Statistics
   */
  async getBatchJobStats(batchJobId) {
    const records = await prisma.fileProcessingRecord.findMany({
      where: { batchJobId }
    });

    return {
      processedFiles: records.filter(r => r.status === 'completed').length,
      failedFiles: records.filter(r => r.status === 'failed').length,
      skippedFiles: records.filter(r => r.status === 'skipped').length
    };
  }

  /**
   * Get file extension
   * @param {string} fileName - File name
   * @returns {string} - File extension
   */
  getFileExtension(fileName) {
    return fileName.split('.').pop();
  }

  /**
   * Stop batch processing
   * @param {number} batchJobId - Batch job ID
   */
  async stopBatchProcessing(batchJobId) {
    const jobInfo = this.activeJobs.get(batchJobId);
    if (!jobInfo) {
      throw new Error(`Batch job ${batchJobId} not found`);
    }

    // Update job status to cancelled
    await prisma.batchJob.update({
      where: { id: batchJobId },
      data: {
        status: 'cancelled',
        completedAt: new Date()
      }
    });

    // Stop monitoring
    if (jobInfo.monitorHandle) {
      await jobInfo.monitorProvider.stopMonitoring(jobInfo.monitorHandle);
    }

    // Remove from active jobs
    this.activeJobs.delete(batchJobId);

    console.log(`⏹️ Stopped batch job ${batchJobId}`);
  }

  /**
   * Get active batch jobs
   * @returns {Array} - Active batch jobs
   */
  getActiveBatchJobs() {
    return Array.from(this.activeJobs.keys());
  }
}

module.exports = new BatchProcessingService();
