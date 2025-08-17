/**
 * Tests for Core Interfaces
 * Validates that interfaces are properly defined and throw appropriate errors
 */

const IStorageProvider = require('../src/services/interfaces/IStorageProvider');
const INotificationProvider = require('../src/services/interfaces/INotificationProvider');
const IFileMonitor = require('../src/services/interfaces/IFileMonitor');

describe('Core Interfaces', () => {
  describe('IStorageProvider', () => {
    let storageProvider;

    beforeEach(() => {
      storageProvider = new IStorageProvider();
    });

    test('should throw error when connect method is not implemented', async () => {
      await expect(storageProvider.connect({})).rejects.toThrow('connect method must be implemented');
    });

    test('should throw error when listFiles method is not implemented', async () => {
      await expect(storageProvider.listFiles('/path')).rejects.toThrow('listFiles method must be implemented');
    });

    test('should throw error when downloadFile method is not implemented', async () => {
      await expect(storageProvider.downloadFile('/remote', '/local')).rejects.toThrow('downloadFile method must be implemented');
    });

    test('should throw error when validateConfig method is not implemented', async () => {
      await expect(storageProvider.validateConfig({})).rejects.toThrow('validateConfig method must be implemented');
    });

    test('should throw error when getType method is not implemented', () => {
      expect(() => storageProvider.getType()).toThrow('getType method must be implemented');
    });

    test('should throw error when testConnection method is not implemented', async () => {
      await expect(storageProvider.testConnection({})).rejects.toThrow('testConnection method must be implemented');
    });
  });

  describe('INotificationProvider', () => {
    let notificationProvider;

    beforeEach(() => {
      notificationProvider = new INotificationProvider();
    });

    test('should throw error when configure method is not implemented', async () => {
      await expect(notificationProvider.configure({})).rejects.toThrow('configure method must be implemented');
    });

    test('should throw error when sendNotification method is not implemented', async () => {
      await expect(notificationProvider.sendNotification({})).rejects.toThrow('sendNotification method must be implemented');
    });

    test('should throw error when validateConfig method is not implemented', async () => {
      await expect(notificationProvider.validateConfig({})).rejects.toThrow('validateConfig method must be implemented');
    });

    test('should throw error when getType method is not implemented', () => {
      expect(() => notificationProvider.getType()).toThrow('getType method must be implemented');
    });

    test('should throw error when testNotification method is not implemented', async () => {
      await expect(notificationProvider.testNotification({})).rejects.toThrow('testNotification method must be implemented');
    });

    test('should throw error when isEnabled method is not implemented', () => {
      expect(() => notificationProvider.isEnabled()).toThrow('isEnabled method must be implemented');
    });
  });

  describe('IFileMonitor', () => {
    let fileMonitor;

    beforeEach(() => {
      fileMonitor = new IFileMonitor();
    });

    test('should throw error when startMonitoring method is not implemented', async () => {
      await expect(fileMonitor.startMonitoring({})).rejects.toThrow('startMonitoring method must be implemented');
    });

    test('should throw error when stopMonitoring method is not implemented', async () => {
      await expect(fileMonitor.stopMonitoring('handle')).rejects.toThrow('stopMonitoring method must be implemented');
    });

    test('should throw error when validateConfig method is not implemented', async () => {
      await expect(fileMonitor.validateConfig({})).rejects.toThrow('validateConfig method must be implemented');
    });

    test('should throw error when getType method is not implemented', () => {
      expect(() => fileMonitor.getType()).toThrow('getType method must be implemented');
    });

    test('should throw error when testMonitoring method is not implemented', async () => {
      await expect(fileMonitor.testMonitoring({})).rejects.toThrow('testMonitoring method must be implemented');
    });

    test('should throw error when getStatus method is not implemented', async () => {
      await expect(fileMonitor.getStatus('handle')).rejects.toThrow('getStatus method must be implemented');
    });

    test('should throw error when scanForFiles method is not implemented', async () => {
      await expect(fileMonitor.scanForFiles({})).rejects.toThrow('scanForFiles method must be implemented');
    });
  });
});
