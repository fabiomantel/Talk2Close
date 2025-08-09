/**
 * Comprehensive File Upload Middleware Tests
 * Tests file validation, upload handling, security, and error handling
 */

const request = require('supertest');
const express = require('express');
const { upload, handleUploadError, cleanupOnError } = require('../src/middleware/fileUpload');
const fs = require('fs-extra');
const path = require('path');

// Mock fs-extra
jest.mock('fs-extra');

describe('File Upload Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default fs mocks
    fs.ensureDir.mockResolvedValue();
    fs.pathExists.mockResolvedValue(true);
    fs.stat.mockResolvedValue({ size: 1024 * 1024 }); // 1MB
    fs.remove.mockResolvedValue();
  });

  describe('upload.single() middleware', () => {
    test('should accept valid audio file', async () => {
      app.post('/test', upload.single('audio'), (req, res) => {
        res.json({ success: true, file: req.file });
      });

      const response = await request(app)
        .post('/test')
        .attach('audio', Buffer.from('fake-audio-data'), 'test.mp3')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.file).toBeDefined();
    });

    test('should reject oversized files', async () => {
      app.post('/test', upload.single('audio'), handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      // Create buffer larger than 50MB (mocked limit)
      const largeBuffer = Buffer.alloc(51 * 1024 * 1024);

      const response = await request(app)
        .post('/test')
        .attach('audio', largeBuffer, 'large.mp3')
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('File too large');
    });

    test('should reject unsupported file types', async () => {
      app.post('/test', upload.single('audio'), handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .attach('audio', Buffer.from('fake-text-data'), 'document.txt')
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('Invalid file type');
    });

    test('should validate file extensions', async () => {
      app.post('/test', upload.single('audio'), handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      const validExtensions = ['test.mp3', 'test.wav', 'test.m4a', 'test.mp4', 'test.webm'];
      
      for (const filename of validExtensions) {
        const response = await request(app)
          .post('/test')
          .attach('audio', Buffer.from('fake-audio-data'), filename);

        expect(response.status).toBe(200);
      }
    });

    test('should create unique filenames to prevent conflicts', async () => {
      let capturedFilenames = [];
      
      app.post('/test', upload.single('audio'), (req, res) => {
        capturedFilenames.push(req.file.filename);
        res.json({ success: true, filename: req.file.filename });
      });

      // Upload same filename multiple times
      const requests = Array(3).fill(null).map(() =>
        request(app)
          .post('/test')
          .attach('audio', Buffer.from('fake-audio-data'), 'same-name.mp3')
      );

      await Promise.all(requests);

      // All filenames should be unique
      const uniqueFilenames = new Set(capturedFilenames);
      expect(uniqueFilenames.size).toBe(capturedFilenames.length);
    });

    test('should preserve original filename in metadata', async () => {
      app.post('/test', upload.single('audio'), (req, res) => {
        res.json({
          success: true,
          originalName: req.file.originalname,
          storedName: req.file.filename
        });
      });

      const response = await request(app)
        .post('/test')
        .attach('audio', Buffer.from('fake-audio-data'), 'my-recording.mp3')
        .expect(200);

      expect(response.body.originalName).toBe('my-recording.mp3');
      expect(response.body.storedName).not.toBe('my-recording.mp3'); // Should be renamed
    });
  });

  describe('handleUploadError middleware', () => {
    test('should handle multer limit exceeded error', async () => {
      app.post('/test', (req, res, next) => {
        const error = new Error('File too large');
        error.code = 'LIMIT_FILE_SIZE';
        next(error);
      }, handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .expect(400);

      expect(response.body).toMatchObject({
        error: true,
        message: 'File size exceeds maximum limit (50MB)',
        code: 'FILE_TOO_LARGE'
      });
    });

    test('should handle unexpected field error', async () => {
      app.post('/test', (req, res, next) => {
        const error = new Error('Unexpected field');
        error.code = 'LIMIT_UNEXPECTED_FILE';
        error.field = 'wrongField';
        next(error);
      }, handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .expect(400);

      expect(response.body).toMatchObject({
        error: true,
        message: 'Unexpected field: wrongField',
        code: 'UNEXPECTED_FIELD'
      });
    });

    test('should handle missing file error', async () => {
      app.post('/test', (req, res, next) => {
        const error = new Error('Missing file');
        error.code = 'MISSING_FILE';
        next(error);
      }, handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .expect(400);

      expect(response.body).toMatchObject({
        error: true,
        message: 'No file uploaded or file field missing',
        code: 'MISSING_FILE'
      });
    });

    test('should handle invalid file type error', async () => {
      app.post('/test', (req, res, next) => {
        const error = new Error('Invalid file type');
        error.code = 'INVALID_FILE_TYPE';
        next(error);
      }, handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .expect(400);

      expect(response.body).toMatchObject({
        error: true,
        message: 'Invalid file type. Only audio files are allowed (mp3, wav, m4a, mp4, webm)',
        code: 'INVALID_FILE_TYPE'
      });
    });

    test('should pass through non-multer errors', async () => {
      app.post('/test', (req, res, next) => {
        const error = new Error('Database connection failed');
        next(error);
      }, handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .expect(500);

      expect(response.body).toHaveProperty('error', true);
    });
  });

  describe('cleanupOnError middleware', () => {
    test('should cleanup uploaded file when validation fails', async () => {
      app.post('/test', upload.single('audio'), cleanupOnError, (req, res, next) => {
        // Simulate validation error
        const error = new Error('Validation failed');
        error.statusCode = 400;
        next(error);
      }, (err, req, res, next) => {
        res.status(err.statusCode || 500).json({
          error: true,
          message: err.message
        });
      });

      await request(app)
        .post('/test')
        .attach('audio', Buffer.from('fake-audio-data'), 'test.mp3')
        .expect(400);

      expect(fs.remove).toHaveBeenCalled();
    });

    test('should cleanup uploaded file when processing fails', async () => {
      app.post('/test', upload.single('audio'), cleanupOnError, (req, res, next) => {
        // Simulate processing error
        throw new Error('Processing failed');
      }, (err, req, res, next) => {
        res.status(500).json({
          error: true,
          message: err.message
        });
      });

      await request(app)
        .post('/test')
        .attach('audio', Buffer.from('fake-audio-data'), 'test.mp3')
        .expect(500);

      expect(fs.remove).toHaveBeenCalled();
    });

    test('should not cleanup file on successful processing', async () => {
      app.post('/test', upload.single('audio'), cleanupOnError, (req, res) => {
        res.json({ success: true });
      });

      await request(app)
        .post('/test')
        .attach('audio', Buffer.from('fake-audio-data'), 'test.mp3')
        .expect(200);

      expect(fs.remove).not.toHaveBeenCalled();
    });

    test('should handle cleanup errors gracefully', async () => {
      fs.remove.mockRejectedValue(new Error('File deletion failed'));

      app.post('/test', upload.single('audio'), cleanupOnError, (req, res, next) => {
        const error = new Error('Validation failed');
        error.statusCode = 400;
        next(error);
      }, (err, req, res, next) => {
        res.status(err.statusCode || 500).json({
          error: true,
          message: err.message
        });
      });

      const response = await request(app)
        .post('/test')
        .attach('audio', Buffer.from('fake-audio-data'), 'test.mp3')
        .expect(400);

      // Should still return the original error, not the cleanup error
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('Security and Edge Cases', () => {
    test('should sanitize malicious filenames', async () => {
      app.post('/test', upload.single('audio'), (req, res) => {
        res.json({
          success: true,
          originalName: req.file.originalname,
          safeName: req.file.filename
        });
      });

      const maliciousNames = [
        '../../../etc/passwd.mp3',
        'file with spaces and special chars!@#.mp3',
        'שם_קובץ_בעברית.mp3',
        'very-long-filename'.repeat(10) + '.mp3'
      ];

      for (const filename of maliciousNames) {
        const response = await request(app)
          .post('/test')
          .attach('audio', Buffer.from('fake-audio-data'), filename)
          .expect(200);

        // Safe name should not contain path traversal
        expect(response.body.safeName).not.toContain('..');
        expect(response.body.safeName).not.toContain('/');
        expect(response.body.safeName).not.toContain('\\');
      }
    });

    test('should handle concurrent uploads without conflicts', async () => {
      const uploadResults = [];
      
      app.post('/test', upload.single('audio'), (req, res) => {
        uploadResults.push(req.file.filename);
        res.json({ success: true, filename: req.file.filename });
      });

      // Simulate concurrent uploads
      const concurrentUploads = Array(10).fill(null).map((_, index) =>
        request(app)
          .post('/test')
          .attach('audio', Buffer.from(`fake-audio-data-${index}`), 'concurrent.mp3')
      );

      const responses = await Promise.all(concurrentUploads);

      // All uploads should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // All filenames should be unique
      const uniqueFilenames = new Set(uploadResults);
      expect(uniqueFilenames.size).toBe(uploadResults.length);
    });

    test('should validate MIME types strictly', async () => {
      app.post('/test', upload.single('audio'), handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      // Test with disguised file (wrong extension)
      const response = await request(app)
        .post('/test')
        .attach('audio', Buffer.from('This is not audio data'), 'fake.mp3')
        .expect(400);

      expect(response.body.message).toContain('Invalid file type');
    });

    test('should enforce storage limits', async () => {
      // Mock filesystem full error
      fs.ensureDir.mockRejectedValue(new Error('ENOSPC: no space left on device'));

      app.post('/test', upload.single('audio'), handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .attach('audio', Buffer.from('fake-audio-data'), 'test.mp3')
        .expect(500);

      expect(response.body).toHaveProperty('error', true);
    });

    test('should handle empty files', async () => {
      app.post('/test', upload.single('audio'), handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .attach('audio', Buffer.alloc(0), 'empty.mp3')
        .expect(400);

      expect(response.body.message).toContain('empty');
    });

    test('should validate file headers for audio files', async () => {
      app.post('/test', upload.single('audio'), handleUploadError, (req, res) => {
        res.json({ success: true });
      });

      // Test with proper MP3 header
      const mp3Header = Buffer.from([0xFF, 0xFB, 0x90, 0x00]); // MP3 frame header
      const validMp3Buffer = Buffer.concat([mp3Header, Buffer.from('fake-audio-data')]);

      const response = await request(app)
        .post('/test')
        .attach('audio', validMp3Buffer, 'valid.mp3')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should handle multiple file uploads efficiently', async () => {
      app.post('/test', upload.single('audio'), (req, res) => {
        res.json({ success: true, size: req.file.size });
      });

      const startTime = Date.now();
      
      const uploads = Array(5).fill(null).map((_, index) =>
        request(app)
          .post('/test')
          .attach('audio', Buffer.from(`data-${index}`), `file${index}.mp3`)
      );

      await Promise.all(uploads);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete all uploads within reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds
    });

    test('should cleanup temporary files on server restart simulation', async () => {
      app.post('/test', upload.single('audio'), (req, res) => {
        // Simulate server crash before response
        process.nextTick(() => {
          throw new Error('Simulated server crash');
        });
      });

      try {
        await request(app)
          .post('/test')
          .attach('audio', Buffer.from('fake-audio-data'), 'test.mp3');
      } catch (error) {
        // Expected to fail
      }

      // Cleanup should still be called
      expect(fs.remove).toHaveBeenCalled();
    });
  });
});
