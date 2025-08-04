const request = require('supertest');
const app = require('../src/server');
const { testConnection } = require('../src/database/connection');

describe('Hebrew Sales Call Analysis System - Basic Tests', () => {
  beforeAll(async () => {
    // Test database connection
    const isConnected = await testConnection();
    expect(isConnected).toBe(true);
  });

  describe('Health Check', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('API Routes', () => {
    test('GET /api/upload should return 200', async () => {
      const response = await request(app)
        .get('/api/upload')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('files');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('GET /api/analyze should return 200', async () => {
      const response = await request(app)
        .get('/api/analyze')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('analyses');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('GET /api/customers should return 200', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('customers');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('GET /api/dashboard/stats should return 200', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('scores');
    });
  });

  describe('Error Handling', () => {
    test('GET /nonexistent should return 404', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    test('GET /api/upload/999 should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/api/upload/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Sales call not found');
    });
  });

  describe('Validation', () => {
    test('POST /api/analyze without salesCallId should return 400', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('errors');
    });

    test('POST /api/customers without required fields should return 400', async () => {
      const response = await request(app)
        .post('/api/customers')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('errors');
    });
  });
}); 