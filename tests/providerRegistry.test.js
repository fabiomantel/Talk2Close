/**
 * Tests for Provider Registry
 * Validates provider registration, retrieval, and management functionality
 */

const providerRegistry = require('../src/services/ProviderRegistry');

describe('Provider Registry', () => {
  beforeEach(() => {
    // Clear registry before each test
    providerRegistry.clear();
  });

  describe('Storage Provider Management', () => {
    const mockStorageProvider = {
      getType: () => 'test-storage',
      connect: jest.fn(),
      listFiles: jest.fn(),
      downloadFile: jest.fn(),
      validateConfig: jest.fn(),
      testConnection: jest.fn()
    };

    test('should register storage provider successfully', () => {
      providerRegistry.registerStorageProvider('test', mockStorageProvider);
      expect(providerRegistry.hasStorageProvider('test')).toBe(true);
    });

    test('should retrieve registered storage provider', () => {
      providerRegistry.registerStorageProvider('test', mockStorageProvider);
      const provider = providerRegistry.getStorageProvider('test');
      expect(provider).toBe(mockStorageProvider);
    });

    test('should return null for non-existent storage provider', () => {
      const provider = providerRegistry.getStorageProvider('non-existent');
      expect(provider).toBeNull();
    });

    test('should list available storage providers', () => {
      providerRegistry.registerStorageProvider('test1', mockStorageProvider);
      providerRegistry.registerStorageProvider('test2', mockStorageProvider);
      
      const providers = providerRegistry.getAvailableStorageProviders();
      expect(providers).toContain('test1');
      expect(providers).toContain('test2');
    });

    test('should check if storage provider exists', () => {
      expect(providerRegistry.hasStorageProvider('test')).toBe(false);
      
      providerRegistry.registerStorageProvider('test', mockStorageProvider);
      expect(providerRegistry.hasStorageProvider('test')).toBe(true);
    });
  });

  describe('Notification Provider Management', () => {
    const mockNotificationProvider = {
      getType: () => 'test-notification',
      configure: jest.fn(),
      sendNotification: jest.fn(),
      validateConfig: jest.fn(),
      testNotification: jest.fn(),
      isEnabled: jest.fn()
    };

    test('should register notification provider successfully', () => {
      providerRegistry.registerNotificationProvider('test', mockNotificationProvider);
      expect(providerRegistry.hasNotificationProvider('test')).toBe(true);
    });

    test('should retrieve registered notification provider', () => {
      providerRegistry.registerNotificationProvider('test', mockNotificationProvider);
      const provider = providerRegistry.getNotificationProvider('test');
      expect(provider).toBe(mockNotificationProvider);
    });

    test('should return null for non-existent notification provider', () => {
      const provider = providerRegistry.getNotificationProvider('non-existent');
      expect(provider).toBeNull();
    });

    test('should list available notification providers', () => {
      providerRegistry.registerNotificationProvider('test1', mockNotificationProvider);
      providerRegistry.registerNotificationProvider('test2', mockNotificationProvider);
      
      const providers = providerRegistry.getAvailableNotificationProviders();
      expect(providers).toContain('test1');
      expect(providers).toContain('test2');
    });

    test('should check if notification provider exists', () => {
      expect(providerRegistry.hasNotificationProvider('test')).toBe(false);
      
      providerRegistry.registerNotificationProvider('test', mockNotificationProvider);
      expect(providerRegistry.hasNotificationProvider('test')).toBe(true);
    });
  });

  describe('Monitor Provider Management', () => {
    const mockMonitorProvider = {
      getType: () => 'test-monitor',
      startMonitoring: jest.fn(),
      stopMonitoring: jest.fn(),
      validateConfig: jest.fn(),
      testMonitoring: jest.fn(),
      getStatus: jest.fn(),
      scanForFiles: jest.fn()
    };

    test('should register monitor provider successfully', () => {
      providerRegistry.registerMonitorProvider('test', mockMonitorProvider);
      expect(providerRegistry.hasMonitorProvider('test')).toBe(true);
    });

    test('should retrieve registered monitor provider', () => {
      providerRegistry.registerMonitorProvider('test', mockMonitorProvider);
      const provider = providerRegistry.getMonitorProvider('test');
      expect(provider).toBe(mockMonitorProvider);
    });

    test('should return null for non-existent monitor provider', () => {
      const provider = providerRegistry.getMonitorProvider('non-existent');
      expect(provider).toBeNull();
    });

    test('should list available monitor providers', () => {
      providerRegistry.registerMonitorProvider('test1', mockMonitorProvider);
      providerRegistry.registerMonitorProvider('test2', mockMonitorProvider);
      
      const providers = providerRegistry.getAvailableMonitorProviders();
      expect(providers).toContain('test1');
      expect(providers).toContain('test2');
    });

    test('should check if monitor provider exists', () => {
      expect(providerRegistry.hasMonitorProvider('test')).toBe(false);
      
      providerRegistry.registerMonitorProvider('test', mockMonitorProvider);
      expect(providerRegistry.hasMonitorProvider('test')).toBe(true);
    });
  });

  describe('Registry Statistics', () => {
    const mockProvider = {
      getType: () => 'test',
      connect: jest.fn(),
      listFiles: jest.fn(),
      downloadFile: jest.fn(),
      validateConfig: jest.fn(),
      testConnection: jest.fn()
    };

    test('should return correct statistics', () => {
      providerRegistry.registerStorageProvider('storage1', mockProvider);
      providerRegistry.registerStorageProvider('storage2', mockProvider);
      providerRegistry.registerNotificationProvider('notification1', mockProvider);
      providerRegistry.registerMonitorProvider('monitor1', mockProvider);

      const stats = providerRegistry.getStats();
      expect(stats.totalProviders).toBe(4);
      expect(stats.storageProviders).toBe(2);
      expect(stats.notificationProviders).toBe(1);
      expect(stats.monitorProviders).toBe(1);
    });

    test('should return empty statistics for empty registry', () => {
      const stats = providerRegistry.getStats();
      expect(stats.totalProviders).toBe(0);
      expect(stats.storageProviders).toBe(0);
      expect(stats.notificationProviders).toBe(0);
      expect(stats.monitorProviders).toBe(0);
    });
  });

  describe('Registry Cleanup', () => {
    const mockProvider = {
      getType: () => 'test',
      connect: jest.fn(),
      listFiles: jest.fn(),
      downloadFile: jest.fn(),
      validateConfig: jest.fn(),
      testConnection: jest.fn()
    };

    test('should clear all providers', () => {
      providerRegistry.registerStorageProvider('storage', mockProvider);
      providerRegistry.registerNotificationProvider('notification', mockProvider);
      providerRegistry.registerMonitorProvider('monitor', mockProvider);

      providerRegistry.clear();

      expect(providerRegistry.getStats().totalProviders).toBe(0);
      expect(providerRegistry.hasStorageProvider('storage')).toBe(false);
      expect(providerRegistry.hasNotificationProvider('notification')).toBe(false);
      expect(providerRegistry.hasMonitorProvider('monitor')).toBe(false);
    });

    test('should clear all providers when clear is called', () => {
      providerRegistry.registerStorageProvider('storage', mockProvider);
      providerRegistry.registerNotificationProvider('notification', mockProvider);
      providerRegistry.registerMonitorProvider('monitor', mockProvider);

      providerRegistry.clear();

      expect(providerRegistry.hasStorageProvider('storage')).toBe(false);
      expect(providerRegistry.hasNotificationProvider('notification')).toBe(false);
      expect(providerRegistry.hasMonitorProvider('monitor')).toBe(false);
    });
  });
});
