/**
 * Provider Registration
 * Registers all available providers with the provider registry
 */

const providerRegistry = require('./ProviderRegistry');

// Storage Providers
const LocalStorageProvider = require('./providers/storage/LocalStorageProvider');

// Monitor Providers
const PollingMonitor = require('./providers/monitors/PollingMonitor');

// Notification Providers
const WebhookNotificationProvider = require('./providers/notifications/WebhookNotificationProvider');

/**
 * Register all available providers
 */
function registerAllProviders() {
  console.log('🔧 Registering all available providers...');

  // Register Storage Providers
  providerRegistry.registerStorageProvider('local', new LocalStorageProvider());

  // Register Monitor Providers
  providerRegistry.registerMonitorProvider('polling', new PollingMonitor());

  // Register Notification Providers
  providerRegistry.registerNotificationProvider('webhook', new WebhookNotificationProvider());

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
  const requiredStorageProviders = ['local'];
  requiredStorageProviders.forEach(provider => {
    const available = providerRegistry.hasStorageProvider(provider);
    results.storage[provider] = available;
    if (!available) results.overall = false;
  });

  // Check monitor providers
  const requiredMonitorProviders = ['polling'];
  requiredMonitorProviders.forEach(provider => {
    const available = providerRegistry.hasMonitorProvider(provider);
    results.monitor[provider] = available;
    if (!available) results.overall = false;
  });

  // Check notification providers
  const requiredNotificationProviders = ['webhook'];
  requiredNotificationProviders.forEach(provider => {
    const available = providerRegistry.hasNotificationProvider(provider);
    results.notification[provider] = available;
    if (!available) results.overall = false;
  });

  return results;
}

/**
 * Initialize provider system
 */
function initializeProviderSystem() {
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
    
    return validation.overall;
    
  } catch (error) {
    console.error('❌ Failed to initialize provider system:', error.message);
    return false;
  }
}

module.exports = {
  registerAllProviders,
  getProviderStatus,
  validateProviderAvailability,
  initializeProviderSystem
};
