/**
 * Tests for Batch Processing API Endpoints
 * Validates API endpoints for batch processing functionality
 */

const request = require('supertest');
const app = require('../src/server');

// Mock the database
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    externalFolder: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, name: 'Test Folder 1', isActive: true },
        { id: 2, name: 'Test Folder 2', isActive: false }
      ]),
      findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Test Folder', isActive: true }),
      create: jest.fn().mockResolvedValue({ id: 1, name: 'New Test Folder' }),
      update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Test Folder' }),
      delete: jest.fn().mockResolvedValue({ id: 1 })
    },
    batchJob: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, name: 'Test Job 1', status: 'completed' },
        { id: 2, name: 'Test Job 2', status: 'running' }
      ]),
      findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Test Job', status: 'completed' }),
      create: jest.fn().mockResolvedValue({ id: 1, name: 'New Test Job' }),
      update: jest.fn().mockResolvedValue({ id: 1, status: 'completed' })
    },
    fileProcessingRecord: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, fileName: 'test1.mp3', status: 'completed' },
        { id: 2, fileName: 'test2.mp3', status: 'failed' }
      ]),
      findUnique: jest.fn().mockResolvedValue({ id: 1, fileName: 'test.mp3', status: 'completed' }),
      create: jest.fn().mockResolvedValue({ id: 1, fileName: 'new-test.mp3' }),
      update: jest.fn().mockResolvedValue({ id: 1, status: 'completed' })
    },
    notificationConfig: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, type: 'email', name: 'Email Notification' },
        { id: 2, type: 'webhook', name: 'Webhook Notification' }
      ]),
      findUnique: jest.fn().mockResolvedValue({ id: 1, type: 'email', name: 'Test Notification' }),
      create: jest.fn().mockResolvedValue({ id: 1, type: 'email', name: 'New Notification' }),
      update: jest.fn().mockResolvedValue({ id: 1, type: 'email', name: 'Updated Notification' }),
      delete: jest.fn().mockResolvedValue({ id: 1 })
    }
  }))
}));

describe('Batch Processing API Endpoints', () => {
  describe('GET /api/batch-config/folders', () => {
    test('should return list of external folders', async () => {
      const response = await request(app)
        .get('/api/batch-config/folders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.folders).toBeDefined();
      expect(Array.isArray(response.body.data.folders)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/batch-config/folders?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/batch-config/folders', () => {
    test('should create new external folder', async () => {
      const folderData = {
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

      const response = await request(app)
        .post('/api/batch-config/folders')
        .send(folderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('New Test Folder');
    });

    test('should validate required fields', async () => {
      const invalidData = {
        name: '',
        storageConfig: {}
      };

      const response = await request(app)
        .post('/api/batch-config/folders')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/batch/jobs', () => {
    test('should return list of batch jobs', async () => {
      const response = await request(app)
        .get('/api/batch/jobs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.jobs).toBeDefined();
      expect(Array.isArray(response.body.data.jobs)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should support status filtering', async () => {
      const response = await request(app)
        .get('/api/batch/jobs?status=completed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobs).toBeDefined();
    });
  });

  describe('POST /api/batch/jobs', () => {
    test('should create new batch job', async () => {
      const jobData = {
        folderId: 1,
        name: 'Test Batch Job',
        maxConcurrentFiles: 5
      };

      const response = await request(app)
        .post('/api/batch/jobs')
        .send(jobData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('New Test Job');
    });

    test('should validate required fields', async () => {
      const invalidData = {
        folderId: null,
        name: ''
      };

      const response = await request(app)
        .post('/api/batch/jobs')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/batch/files', () => {
    test('should return list of file processing records', async () => {
      const response = await request(app)
        .get('/api/batch/files')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.files).toBeDefined();
      expect(Array.isArray(response.body.data.files)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should support status filtering', async () => {
      const response = await request(app)
        .get('/api/batch/files?status=completed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.files).toBeDefined();
    });
  });

  describe('GET /api/batch/files/:id', () => {
    test('should return specific file processing record', async () => {
      const response = await request(app)
        .get('/api/batch/files/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.fileName).toBe('test.mp3');
      expect(response.body.data.status).toBe('completed');
    });

    test('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/api/batch/files/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/batch/files/:id/retry', () => {
    test('should retry failed file processing', async () => {
      const response = await request(app)
        .post('/api/batch/files/1/retry')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('retry');
    });
  });

  describe('GET /api/batch-config/notifications', () => {
    test('should return list of notification configurations', async () => {
      const response = await request(app)
        .get('/api/batch-config/notifications')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.notifications).toBeDefined();
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
    });
  });

  describe('POST /api/batch-config/notifications', () => {
    test('should create new notification configuration', async () => {
      const notificationData = {
        type: 'email',
        name: 'Test Email Notification',
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

      const response = await request(app)
        .post('/api/batch-config/notifications')
        .send(notificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBe('email');
    });

    test('should validate notification configuration', async () => {
      const invalidData = {
        type: 'invalid',
        name: ''
      };

      const response = await request(app)
        .post('/api/batch-config/notifications')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/batch-config/folders')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/batch-config/folders')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/batch/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
