/**
 * File Status Tracking Service
 * Manages file processing status and provides detailed tracking information
 */

const { prisma } = require('../database/connection');

class FileStatusTrackingService {
  constructor() {
    this.statusTransitions = {
      discovered: ['queued', 'skipped'],
      queued: ['processing', 'skipped'],
      processing: ['completed', 'failed', 'retrying'],
      retrying: ['processing', 'failed'],
      completed: [],
      failed: ['retrying'],
      skipped: []
    };
  }

  /**
   * Get file processing record by ID
   * @param {number} fileRecordId - File record ID
   * @returns {Promise<Object>} - File processing record
   */
  async getFileRecord(fileRecordId) {
    try {
      const record = await prisma.fileProcessingRecord.findUnique({
        where: { id: fileRecordId },
        include: {
          batchJob: {
            include: {
              folder: true
            }
          },
          salesCall: {
            include: {
              customer: true
            }
          }
        }
      });

      if (!record) {
        throw new Error(`File processing record with ID ${fileRecordId} not found`);
      }

      return record;

    } catch (error) {
      console.error(`❌ Failed to get file record: ${error.message}`);
      throw error;
    }
  }

  /**
   * List file processing records
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Records with pagination
   */
  async listFileRecords(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        batchJobId,
        status,
        fileName,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const offset = (page - 1) * limit;
      const where = {};

      if (batchJobId) {
        where.batchJobId = parseInt(batchJobId);
      }

      if (status) {
        where.status = status;
      }

      if (fileName) {
        where.fileName = {
          contains: fileName,
          mode: 'insensitive'
        };
      }

      const [records, total] = await Promise.all([
        prisma.fileProcessingRecord.findMany({
          where,
          include: {
            batchJob: {
              select: {
                id: true,
                name: true,
                status: true,
                folder: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            salesCall: {
              select: {
                id: true,
                overallScore: true,
                customer: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip: offset,
          take: parseInt(limit)
        }),
        prisma.fileProcessingRecord.count({ where })
      ]);

      return {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error(`❌ Failed to list file records: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update file processing status
   * @param {number} fileRecordId - File record ID
   * @param {string} newStatus - New status
   * @param {Object} additionalData - Additional data to update
   * @returns {Promise<Object>} - Updated record
   */
  async updateFileStatus(fileRecordId, newStatus, additionalData = {}) {
    try {
      console.log(`📝 Updating file record ${fileRecordId} status to: ${newStatus}`);

      // Get current record
      const currentRecord = await prisma.fileProcessingRecord.findUnique({
        where: { id: fileRecordId }
      });

      if (!currentRecord) {
        throw new Error(`File processing record with ID ${fileRecordId} not found`);
      }

      // Validate status transition
      if (!this.isValidStatusTransition(currentRecord.status, newStatus)) {
        throw new Error(`Invalid status transition from ${currentRecord.status} to ${newStatus}`);
      }

      // Prepare update data
      const updateData = {
        status: newStatus,
        ...additionalData
      };

      // Add timestamps based on status
      if (newStatus === 'processing' && !currentRecord.processingStartedAt) {
        updateData.processingStartedAt = new Date();
      }

      if (['completed', 'failed', 'skipped'].includes(newStatus)) {
        updateData.processingCompletedAt = new Date();
      }

      // Update record
      const updatedRecord = await prisma.fileProcessingRecord.update({
        where: { id: fileRecordId },
        data: updateData,
        include: {
          batchJob: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      });

      console.log(`✅ Updated file record ${fileRecordId} status to: ${newStatus}`);
      return updatedRecord;

    } catch (error) {
      console.error(`❌ Failed to update file status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retry failed file processing
   * @param {number} fileRecordId - File record ID
   * @returns {Promise<Object>} - Updated record
   */
  async retryFileProcessing(fileRecordId) {
    try {
      console.log(`🔄 Retrying file processing for record ID: ${fileRecordId}`);

      const record = await prisma.fileProcessingRecord.findUnique({
        where: { id: fileRecordId }
      });

      if (!record) {
        throw new Error(`File processing record with ID ${fileRecordId} not found`);
      }

      if (record.status !== 'failed') {
        throw new Error(`Cannot retry file with status: ${record.status}`);
      }

      // Reset error information and set status to retrying
      const updatedRecord = await prisma.fileProcessingRecord.update({
        where: { id: fileRecordId },
        data: {
          status: 'retrying',
          errorCode: null,
          errorMessage: null,
          errorDetails: null,
          processingStartedAt: null,
          processingCompletedAt: null
        }
      });

      console.log(`✅ File record ${fileRecordId} marked for retry`);
      return updatedRecord;

    } catch (error) {
      console.error(`❌ Failed to retry file processing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get file processing statistics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Statistics
   */
  async getFileProcessingStats(options = {}) {
    try {
      const { batchJobId, timeRange } = options;
      const where = {};

      if (batchJobId) {
        where.batchJobId = parseInt(batchJobId);
      }

      if (timeRange) {
        where.createdAt = {
          gte: new Date(Date.now() - timeRange * 60 * 60 * 1000) // Convert hours to milliseconds
        };
      }

      const records = await prisma.fileProcessingRecord.findMany({
        where,
        select: {
          status: true,
          fileSize: true,
          processingStartedAt: true,
          processingCompletedAt: true,
          retryCount: true
        }
      });

      const stats = {
        total: records.length,
        byStatus: {},
        averageFileSize: 0,
        averageProcessingTime: 0,
        totalRetries: 0,
        successRate: 0
      };

      let totalFileSize = 0;
      let totalProcessingTime = 0;
      let completedCount = 0;

      records.forEach(record => {
        // Count by status
        stats.byStatus[record.status] = (stats.byStatus[record.status] || 0) + 1;

        // Calculate file size
        if (record.fileSize) {
          totalFileSize += Number(record.fileSize);
        }

        // Calculate processing time
        if (record.processingStartedAt && record.processingCompletedAt) {
          const processingTime = record.processingCompletedAt.getTime() - record.processingStartedAt.getTime();
          totalProcessingTime += processingTime;
          completedCount++;
        }

        // Count retries
        stats.totalRetries += record.retryCount || 0;
      });

      // Calculate averages
      if (records.length > 0) {
        stats.averageFileSize = totalFileSize / records.length;
      }

      if (completedCount > 0) {
        stats.averageProcessingTime = totalProcessingTime / completedCount;
      }

      // Calculate success rate
      const successfulCount = stats.byStatus.completed || 0;
      const failedCount = stats.byStatus.failed || 0;
      const totalProcessed = successfulCount + failedCount;

      if (totalProcessed > 0) {
        stats.successRate = (successfulCount / totalProcessed) * 100;
      }

      return stats;

    } catch (error) {
      console.error(`❌ Failed to get file processing stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get file processing logs
   * @param {number} fileRecordId - File record ID
   * @returns {Promise<Object>} - Processing logs
   */
  async getFileProcessingLogs(fileRecordId) {
    try {
      const record = await prisma.fileProcessingRecord.findUnique({
        where: { id: fileRecordId },
        include: {
          batchJob: {
            select: {
              id: true,
              name: true,
              status: true,
              folder: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      if (!record) {
        throw new Error(`File processing record with ID ${fileRecordId} not found`);
      }

      const logs = {
        fileRecord: record,
        timeline: [],
        errorDetails: null
      };

      // Build timeline
      if (record.createdAt) {
        logs.timeline.push({
          timestamp: record.createdAt,
          event: 'discovered',
          description: `File discovered in batch job: ${record.batchJob.name}`
        });
      }

      if (record.processingStartedAt) {
        logs.timeline.push({
          timestamp: record.processingStartedAt,
          event: 'processing_started',
          description: 'File processing started'
        });
      }

      if (record.processingCompletedAt) {
        logs.timeline.push({
          timestamp: record.processingCompletedAt,
          event: 'processing_completed',
          description: `File processing completed with status: ${record.status}`
        });
      }

      // Add retry events if applicable
      if (record.retryCount > 0) {
        for (let i = 1; i <= record.retryCount; i++) {
          logs.timeline.push({
            timestamp: record.updatedAt, // Approximate retry time
            event: 'retry_attempt',
            description: `Retry attempt ${i} of ${record.maxRetries}`
          });
        }
      }

      // Sort timeline by timestamp
      logs.timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Add error details if available
      if (record.errorDetails) {
        logs.errorDetails = record.errorDetails;
      }

      return logs;

    } catch (error) {
      console.error(`❌ Failed to get file processing logs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get error summary for batch job
   * @param {number} batchJobId - Batch job ID
   * @returns {Promise<Object>} - Error summary
   */
  async getBatchJobErrorSummary(batchJobId) {
    try {
      const failedRecords = await prisma.fileProcessingRecord.findMany({
        where: {
          batchJobId: parseInt(batchJobId),
          status: { in: ['failed', 'skipped'] }
        },
        select: {
          errorCode: true,
          errorMessage: true,
          fileName: true
        }
      });

      const errorSummary = {
        totalErrors: failedRecords.length,
        byErrorCode: {},
        byErrorMessage: {},
        files: failedRecords.map(record => ({
          fileName: record.fileName,
          errorCode: record.errorCode,
          errorMessage: record.errorMessage
        }))
      };

      // Group by error code
      failedRecords.forEach(record => {
        if (record.errorCode) {
          errorSummary.byErrorCode[record.errorCode] = (errorSummary.byErrorCode[record.errorCode] || 0) + 1;
        }
      });

      // Group by error message (first 50 characters)
      failedRecords.forEach(record => {
        if (record.errorMessage) {
          const shortMessage = record.errorMessage.substring(0, 50) + (record.errorMessage.length > 50 ? '...' : '');
          errorSummary.byErrorMessage[shortMessage] = (errorSummary.byErrorMessage[shortMessage] || 0) + 1;
        }
      });

      return errorSummary;

    } catch (error) {
      console.error(`❌ Failed to get batch job error summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate status transition
   * @param {string} currentStatus - Current status
   * @param {string} newStatus - New status
   * @returns {boolean} - True if transition is valid
   */
  isValidStatusTransition(currentStatus, newStatus) {
    const allowedTransitions = this.statusTransitions[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Get all possible status transitions
   * @returns {Object} - Status transitions map
   */
  getStatusTransitions() {
    return this.statusTransitions;
  }

  /**
   * Get status descriptions
   * @returns {Object} - Status descriptions
   */
  getStatusDescriptions() {
    return {
      discovered: 'File discovered in external folder',
      queued: 'File queued for processing',
      processing: 'File currently being processed',
      completed: 'File processing completed successfully',
      failed: 'File processing failed',
      retrying: 'File being retried after failure',
      skipped: 'File skipped due to validation issues'
    };
  }

  /**
   * Get error code descriptions
   * @returns {Object} - Error code descriptions
   */
  getErrorCodeDescriptions() {
    return {
      FILE_TOO_LARGE: 'File size exceeds configured limit',
      INVALID_FORMAT: 'File format is not supported',
      INVALID_FILENAME: 'File name does not match UUID pattern',
      ACCESS_DENIED: 'Permission denied accessing file',
      CORRUPTED_FILE: 'File appears to be corrupted',
      DUPLICATE_FILE: 'File has already been processed',
      PROCESSING_ERROR: 'Error during file processing',
      MAX_RETRIES_EXCEEDED: 'Maximum retry attempts exceeded',
      NETWORK_ERROR: 'Network error during file download',
      STORAGE_ERROR: 'Error accessing storage provider'
    };
  }
}

module.exports = new FileStatusTrackingService();
