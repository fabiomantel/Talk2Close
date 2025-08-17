/**
 * Tests for Batch Processing Services
 * Validates core services for batch processing functionality
 */

// Mock services that require external dependencies
jest.mock('../src/services/whisperService');
jest.mock('../src/services/scoringService');
jest.mock('../src/services/enhancedScoringService');

const BatchProcessingService = require('../src/services/BatchProcessingService');
const BatchConfigurationService = require('../src/services/BatchConfigurationService');
const FileStatusTrackingService = require('../src/services/FileStatusTrackingService');
const providerRegistry = require('../src/services/ProviderRegistry');

// Mock the database
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    externalFolder: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1, name: 'Test Folder' }),
      update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Folder' }),
      delete: jest.fn().mockResolvedValue({ id: 1 })
    },
    batchJob: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1, name: 'Test Job' }),
      update: jest.fn().mockResolvedValue({ id: 1, status: 'completed' })
    },
    fileProcessingRecord: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1, fileName: 'test.mp3' }),
      update: jest.fn().mockResolvedValue({ id: 1, status: 'completed' })
    },
    notificationConfig: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1, type: 'email' }),
      update: jest.fn().mockResolvedValue({ id: 1, type: 'email' }),
      delete: jest.fn().mockResolvedValue({ id: 1 })
    }
  }))
}));

describe('Batch Processing Services', () => {
  let batchProcessingService;
  let batchConfigurationService;
  let fileStatusTrackingService;

  beforeEach(() => {
    batchProcessingService = new BatchProcessingService();
    batchConfigurationService = new BatchConfigurationService();
    fileStatusTrackingService = new FileStatusTrackingService();
    
    // Clear provider registry
    providerRegistry.clear();
  });

  describe('BatchProcessingService', () => {
    test('should be instantiated correctly', () => {
      expect(batchProcessingService).toBeDefined();
      expect(typeof batchProcessingService.startBatchProcessing).toBe('function');
      expect(typeof batchProcessingService.stopBatchProcessing).toBe('function');
      expect(typeof batchProcessingService.getBatchStatus).toBe('function');
    });

    test('should validate batch configuration', () => {
      const validConfig = {
        folderId: 1,
        maxConcurrentFiles: 5,
        retryConfig: {
          enabled: true,
          maxRetries: 3,
          delaySeconds: 60
        }
      };

      const result = batchProcessingService.validateBatchConfiguration(validConfig);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid batch configuration', () => {
      const invalidConfig = {
        folderId: null,
        maxConcurrentFiles: -1
      };

      const result = batchProcessingService.validateBatchConfiguration(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should create batch job', async () => {
      const jobConfig = {
        folderId: 1,
        name: 'Test Batch Job',
        maxConcurrentFiles: 5
      };

      const job = await batchProcessingService.createBatchJob(jobConfig);
      expect(job).toBeDefined();
      expect(job.name).toBe('Test Batch Job');
    });

    test('should get batch status', async () => {
      const status = await batchProcessingService.getBatchStatus();
      expect(status).toBeDefined();
      expect(typeof status.isRunning).toBe('boolean');
      expect(typeof status.activeJobs).toBe('number');
    });
  });

  describe('BatchConfigurationService', () => {
    test('should be instantiated correctly', () => {
      expect(batchConfigurationService).toBeDefined();
      expect(typeof batchConfigurationService.createExternalFolder).toBe('function');
      expect(typeof batchConfigurationService.updateExternalFolder).toBe('function');
      expect(typeof batchConfigurationService.deleteExternalFolder).toBe('function');
      expect(typeof batchConfigurationService.testFolderConnection).toBe('function');
    });

    test('should create external folder configuration', async () => {
      const folderConfig = {
        name: 'Test Folder',
        storageConfig: {
          type: 'local',
          config: { path: '/test/path' }
        },
        monitorConfig: {
          type: 'polling',
          config: { scanInterval: 5000 }
        },
        processingConfig: {
          maxFileSize: 524288000,
          allowedExtensions: ['.mp3', '.wav'],
          autoStart: true
        }
      };

      const folder = await batchConfigurationService.createExternalFolder(folderConfig);
      expect(folder).toBeDefined();
      expect(folder.name).toBe('Test Folder');
    });

    test('should validate external folder configuration', () => {
      const validConfig = {
        name: 'Test Folder',
        storageConfig: {
          type: 'local',
          config: { path: '/test/path' }
        },
        monitorConfig: {
          type: 'polling',
          config: { scanInterval: 5000 }
        }
      };

      const result = batchConfigurationService.validateFolderConfiguration(validConfig);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid folder configuration', () => {
      const invalidConfig = {
        name: '',
        storageConfig: {}
      };

      const result = batchConfigurationService.validateFolderConfiguration(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should create notification configuration', async () => {
      const notificationConfig = {
        type: 'email',
        name: 'Test Notification',
        config: {
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
            user: 'test@example.com',
            pass: 'password'
          }
        },
        conditions: ['file_failed', 'batch_completed']
      };

      const notification = await batchConfigurationService.createNotificationConfig(notificationConfig);
      expect(notification).toBeDefined();
      expect(notification.type).toBe('email');
    });

    test('should validate notification configuration', () => {
      const validConfig = {
        type: 'email',
        name: 'Test Notification',
        config: {
          host: 'smtp.gmail.com',
          port: 587
        },
        conditions: ['file_failed']
      };

      const result = batchConfigurationService.validateNotificationConfiguration(validConfig);
      expect(result.isValid).toBe(true);
    });
  });

  describe('FileStatusTrackingService', () => {
    test('should be instantiated correctly', () => {
      expect(fileStatusTrackingService).toBeDefined();
      expect(typeof fileStatusTrackingService.createFileRecord).toBe('function');
      expect(typeof fileStatusTrackingService.updateFileStatus).toBe('function');
      expect(typeof fileStatusTrackingService.getFileRecord).toBe('function');
      expect(typeof fileStatusTrackingService.getBatchFileRecords).toBe('function');
    });

    test('should create file processing record', async () => {
      const fileRecord = {
        batchJobId: 1,
        fileName: 'test.mp3',
        filePath: '/test/path/test.mp3',
        fileSize: 1024000
      };

      const record = await fileStatusTrackingService.createFileRecord(fileRecord);
      expect(record).toBeDefined();
      expect(record.fileName).toBe('test.mp3');
      expect(record.status).toBe('discovered');
    });

    test('should update file status', async () => {
      const updateData = {
        status: 'processing',
        processingStartedAt: new Date()
      };

      const record = await fileStatusTrackingService.updateFileStatus(1, updateData);
      expect(record).toBeDefined();
      expect(record.status).toBe('processing');
    });

    test('should get file statistics', async () => {
      const stats = await fileStatusTrackingService.getFileStatistics(1);
      expect(stats).toBeDefined();
      expect(typeof stats.totalFiles).toBe('number');
      expect(typeof stats.completedFiles).toBe('number');
      expect(typeof stats.failedFiles).toBe('number');
      expect(typeof stats.processingFiles).toBe('number');
    });

    test('should get file processing logs', async () => {
      const logs = await fileStatusTrackingService.getFileProcessingLogs(1);
      expect(Array.isArray(logs)).toBe(true);
    });

    test('should retry failed file', async () => {
      const result = await fileStatusTrackingService.retryFailedFile(1);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Service Integration', () => {
    test('should handle complete batch processing workflow', async () => {
      // Create folder configuration
      const folderConfig = {
        name: 'Integration Test Folder',
        storageConfig: {
          type: 'local',
          config: { path: '/test/path' }
        },
        monitorConfig: {
          type: 'polling',
          config: { scanInterval: 5000 }
        }
      };

      const folder = await batchConfigurationService.createExternalFolder(folderConfig);
      expect(folder).toBeDefined();

      // Create batch job
      const jobConfig = {
        folderId: folder.id,
        name: 'Integration Test Job',
        maxConcurrentFiles: 3
      };

      const job = await batchProcessingService.createBatchJob(jobConfig);
      expect(job).toBeDefined();

      // Create file record
      const fileRecord = {
        batchJobId: job.id,
        fileName: 'integration-test.mp3',
        filePath: '/test/path/integration-test.mp3',
        fileSize: 2048000
      };

      const record = await fileStatusTrackingService.createFileRecord(fileRecord);
      expect(record).toBeDefined();

      // Update file status
      const updatedRecord = await fileStatusTrackingService.updateFileStatus(record.id, {
        status: 'completed',
        processingCompletedAt: new Date()
      });

      expect(updatedRecord.status).toBe('completed');
    });
  });
});
