/**
 * Provider Registration
 * Registers all available providers with the provider registry
 */

const providerRegistry = require('./ProviderRegistry');

// Storage Providers
const LocalStorageProvider = require('./providers/storage/LocalStorageProvider');
const S3StorageProvider = require('./providers/storage/S3StorageProvider');

// Monitor Providers
const PollingMonitor = require('./providers/monitors/PollingMonitor');
const EventBasedMonitor = require('./providers/monitors/EventBasedMonitor');

// Notification Providers
const WebhookNotificationProvider = require('./providers/notifications/WebhookNotificationProvider');
const EmailNotificationProvider = require('./providers/notifications/EmailNotificationProvider');

/**
 * Register all available providers
 */
function registerAllProviders() {
  console.log('🔧 Registering all available providers...');

  // Register Storage Providers
  providerRegistry.registerStorageProvider('local', new LocalStorageProvider());
  providerRegistry.registerStorageProvider('s3', new S3StorageProvider());

  // Register Monitor Providers
  providerRegistry.registerMonitorProvider('polling', new PollingMonitor());
  providerRegistry.registerMonitorProvider('events', new EventBasedMonitor());

  // Register Notification Providers
  providerRegistry.registerNotificationProvider('webhook', new WebhookNotificationProvider());
  providerRegistry.registerNotificationProvider('email', new EmailNotificationProvider());

  console.log('✅ All providers registered successfully');
  console.log('📊 Provider Registry Stats:', providerRegistry.getStats());
}

/**
 * Get provider registration status
 * @returns {Object} - Registration status
 */
function getProviderStatus() {
  return {
    storage: {
      available: providerRegistry.getAvailableStorageProviders(),
      count: providerRegistry.getAvailableStorageProviders().length
    },
    monitor: {
      available: providerRegistry.getAvailableMonitorProviders(),
      count: providerRegistry.getAvailableMonitorProviders().length
    },
    notification: {
      available: providerRegistry.getAvailableNotificationProviders(),
      count: providerRegistry.getAvailableNotificationProviders().length
    },
    total: providerRegistry.getStats().totalProviders
  };
}

/**
 * Validate provider availability
 * @returns {Object} - Validation results
 */
function validateProviderAvailability() {
  const results = {
    storage: {},
    monitor: {},
    notification: {},
    overall: true
  };

  // Check storage providers
  const requiredStorageProviders = ['local', 's3'];
  requiredStorageProviders.forEach(provider => {
    const available = providerRegistry.hasStorageProvider(provider);
    results.storage[provider] = available;
    if (!available) results.overall = false;
  });

  // Check monitor providers
  const requiredMonitorProviders = ['polling', 'events'];
  requiredMonitorProviders.forEach(provider => {
    const available = providerRegistry.hasMonitorProvider(provider);
    results.monitor[provider] = available;
    if (!available) results.overall = false;
  });

  // Check notification providers
  const requiredNotificationProviders = ['webhook', 'email'];
  requiredNotificationProviders.forEach(provider => {
    const available = providerRegistry.hasNotificationProvider(provider);
    results.notification[provider] = available;
    if (!available) results.overall = false;
  });

  return results;
}

/**
 * Initialize provider system
 * @returns {Promise<boolean>} - Promise that resolves to initialization success status
 */
function initializeProviderSystem() {
  return new Promise((resolve) => {
    try {
      console.log('🚀 Initializing provider system...');
      
      // Register all providers
      registerAllProviders();
      
      // Validate availability
      const validation = validateProviderAvailability();
      
      if (validation.overall) {
        console.log('✅ Provider system initialized successfully');
        console.log('📋 Provider Status:', getProviderStatus());
      } else {
        console.warn('⚠️ Some required providers are missing');
        console.log('🔍 Validation Results:', validation);
      }
      
      resolve(validation.overall);
      
    } catch (error) {
      console.error('❌ Failed to initialize provider system:', error.message);
      resolve(false);
    }
  });
}

module.exports = {
  registerAllProviders,
  getProviderStatus,
  validateProviderAvailability,
  initializeProviderSystem
};
