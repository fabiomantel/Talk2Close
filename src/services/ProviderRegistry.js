/**
 * Provider Registry
 * Manages all available providers for storage, notifications, and monitoring
 */

class ProviderRegistry {
  constructor() {
    this.storageProviders = new Map();
    this.notificationProviders = new Map();
    this.monitorProviders = new Map();
  }

  /**
   * Register a storage provider
   * @param {string} type - Provider type identifier
   * @param {IStorageProvider} provider - Provider instance
   */
  registerStorageProvider(type, provider) {
    if (!provider || typeof provider.getType !== 'function') {
      throw new Error('Invalid storage provider: must implement IStorageProvider interface');
    }
    this.storageProviders.set(type, provider);
    console.log(`✅ Registered storage provider: ${type}`);
  }

  /**
   * Register a notification provider
   * @param {string} type - Provider type identifier
   * @param {INotificationProvider} provider - Provider instance
   */
  registerNotificationProvider(type, provider) {
    if (!provider || typeof provider.getType !== 'function') {
      throw new Error('Invalid notification provider: must implement INotificationProvider interface');
    }
    this.notificationProviders.set(type, provider);
    console.log(`✅ Registered notification provider: ${type}`);
  }

  /**
   * Register a monitor provider
   * @param {string} type - Provider type identifier
   * @param {IFileMonitor} provider - Provider instance
   */
  registerMonitorProvider(type, provider) {
    if (!provider || typeof provider.getType !== 'function') {
      throw new Error('Invalid monitor provider: must implement IFileMonitor interface');
    }
    this.monitorProviders.set(type, provider);
    console.log(`✅ Registered monitor provider: ${type}`);
  }

  /**
   * Get storage provider by type
   * @param {string} type - Provider type
   * @returns {IStorageProvider|null} - Provider instance or null if not found
   */
  getStorageProvider(type) {
    return this.storageProviders.get(type) || null;
  }

  /**
   * Get notification provider by type
   * @param {string} type - Provider type
   * @returns {INotificationProvider|null} - Provider instance or null if not found
   */
  getNotificationProvider(type) {
    return this.notificationProviders.get(type) || null;
  }

  /**
   * Get monitor provider by type
   * @param {string} type - Provider type
   * @returns {IFileMonitor|null} - Provider instance or null if not found
   */
  getMonitorProvider(type) {
    return this.monitorProviders.get(type) || null;
  }

  /**
   * Get all available storage provider types
   * @returns {Array<string>} - Array of provider types
   */
  getAvailableStorageProviders() {
    return Array.from(this.storageProviders.keys());
  }

  /**
   * Get all available notification provider types
   * @returns {Array<string>} - Array of provider types
   */
  getAvailableNotificationProviders() {
    return Array.from(this.notificationProviders.keys());
  }

  /**
   * Get all available monitor provider types
   * @returns {Array<string>} - Array of provider types
   */
  getAvailableMonitorProviders() {
    return Array.from(this.monitorProviders.keys());
  }

  /**
   * Check if storage provider exists
   * @param {string} type - Provider type
   * @returns {boolean} - True if provider exists
   */
  hasStorageProvider(type) {
    return this.storageProviders.has(type);
  }

  /**
   * Check if notification provider exists
   * @param {string} type - Provider type
   * @returns {boolean} - True if provider exists
   */
  hasNotificationProvider(type) {
    return this.notificationProviders.has(type);
  }

  /**
   * Check if monitor provider exists
   * @param {string} type - Provider type
   * @returns {boolean} - True if provider exists
   */
  hasMonitorProvider(type) {
    return this.monitorProviders.has(type);
  }

  /**
   * Get registry statistics
   * @returns {Object} - Registry statistics
   */
  getStats() {
    return {
      storageProviders: this.storageProviders.size,
      notificationProviders: this.notificationProviders.size,
      monitorProviders: this.monitorProviders.size,
      totalProviders: this.storageProviders.size + this.notificationProviders.size + this.monitorProviders.size
    };
  }

  /**
   * Clear all providers (useful for testing)
   */
  clear() {
    this.storageProviders.clear();
    this.notificationProviders.clear();
    this.monitorProviders.clear();
    console.log('🧹 Cleared all providers from registry');
  }
}

// Create singleton instance
const providerRegistry = new ProviderRegistry();

module.exports = providerRegistry;
