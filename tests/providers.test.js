/**
 * Tests for Provider Implementations
 * Validates concrete provider implementations against interfaces
 */

const LocalStorageProvider = require('../src/services/providers/storage/LocalStorageProvider');
const S3StorageProvider = require('../src/services/providers/storage/S3StorageProvider');
const PollingMonitor = require('../src/services/providers/monitors/PollingMonitor');
const EventBasedMonitor = require('../src/services/providers/monitors/EventBasedMonitor');
const WebhookNotificationProvider = require('../src/services/providers/notifications/WebhookNotificationProvider');
const EmailNotificationProvider = require('../src/services/providers/notifications/EmailNotificationProvider');

// Mock external dependencies
jest.mock('aws-sdk');
jest.mock('nodemailer');
jest.mock('fs-extra');

describe('Provider Implementations', () => {

  describe('LocalStorageProvider', () => {
    let provider;

    beforeEach(() => {
      provider = new LocalStorageProvider();
    });

    test('should implement IStorageProvider interface', () => {
      expect(typeof provider.connect).toBe('function');
      expect(typeof provider.listFiles).toBe('function');
      expect(typeof provider.downloadFile).toBe('function');
      expect(typeof provider.validateConfig).toBe('function');
      expect(typeof provider.getType).toBe('function');
      expect(typeof provider.testConnection).toBe('function');
    });

    test('should return correct type', () => {
      expect(provider.getType()).toBe('local');
    });

    test('should validate config structure', async () => {
      const result = await provider.validateConfig({});
      expect(typeof result).toBe('object');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('S3StorageProvider', () => {
    let provider;
    let mockS3;

    beforeEach(() => {
      provider = new S3StorageProvider();
    });

    test('should implement IStorageProvider interface', () => {
      expect(typeof provider.connect).toBe('function');
      expect(typeof provider.listFiles).toBe('function');
      expect(typeof provider.downloadFile).toBe('function');
      expect(typeof provider.validateConfig).toBe('function');
      expect(typeof provider.getType).toBe('function');
      expect(typeof provider.testConnection).toBe('function');
    });

    test('should return correct type', () => {
      expect(provider.getType()).toBe('s3');
    });

    test('should validate config structure', async () => {
      const result = await provider.validateConfig({});
      expect(typeof result).toBe('object');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('PollingMonitor', () => {
    let provider;

    beforeEach(() => {
      provider = new PollingMonitor();
    });

    test('should implement IFileMonitor interface', () => {
      expect(typeof provider.startMonitoring).toBe('function');
      expect(typeof provider.stopMonitoring).toBe('function');
      expect(typeof provider.validateConfig).toBe('function');
      expect(typeof provider.getType).toBe('function');
      expect(typeof provider.testMonitoring).toBe('function');
      expect(typeof provider.getStatus).toBe('function');
      expect(typeof provider.scanForFiles).toBe('function');
    });

    test('should return correct type', () => {
      expect(provider.getType()).toBe('polling');
    });

    test('should validate config structure', async () => {
      const result = await provider.validateConfig({});
      expect(typeof result).toBe('object');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('EventBasedMonitor', () => {
    let provider;

    beforeEach(() => {
      provider = new EventBasedMonitor();
    });

    test('should implement IFileMonitor interface', () => {
      expect(typeof provider.startMonitoring).toBe('function');
      expect(typeof provider.stopMonitoring).toBe('function');
      expect(typeof provider.validateConfig).toBe('function');
      expect(typeof provider.getType).toBe('function');
      expect(typeof provider.testMonitoring).toBe('function');
      expect(typeof provider.getStatus).toBe('function');
      expect(typeof provider.scanForFiles).toBe('function');
    });

    test('should return correct type', () => {
      expect(provider.getType()).toBe('events');
    });

    test('should validate config structure', async () => {
      const result = await provider.validateConfig({});
      expect(typeof result).toBe('object');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('WebhookNotificationProvider', () => {
    let provider;

    beforeEach(() => {
      provider = new WebhookNotificationProvider();
    });

    test('should implement INotificationProvider interface', () => {
      expect(typeof provider.configure).toBe('function');
      expect(typeof provider.sendNotification).toBe('function');
      expect(typeof provider.validateConfig).toBe('function');
      expect(typeof provider.getType).toBe('function');
      expect(typeof provider.testNotification).toBe('function');
      expect(typeof provider.isEnabled).toBe('function');
    });

    test('should return correct type', () => {
      expect(provider.getType()).toBe('webhook');
    });

    test('should validate config structure', async () => {
      const result = await provider.validateConfig({});
      expect(typeof result).toBe('object');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('EmailNotificationProvider', () => {
    let provider;

    beforeEach(() => {
      provider = new EmailNotificationProvider();
    });

    test('should implement INotificationProvider interface', () => {
      expect(typeof provider.configure).toBe('function');
      expect(typeof provider.sendNotification).toBe('function');
      expect(typeof provider.validateConfig).toBe('function');
      expect(typeof provider.getType).toBe('function');
      expect(typeof provider.testNotification).toBe('function');
      expect(typeof provider.isEnabled).toBe('function');
    });

    test('should return correct type', () => {
      expect(provider.getType()).toBe('email');
    });

    test('should validate config structure', async () => {
      const result = await provider.validateConfig({});
      expect(typeof result).toBe('object');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });
});
