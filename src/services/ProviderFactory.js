/**
 * Provider Factory
 * Creates and configures provider instances based on configuration
 */

const providerRegistry = require('./ProviderRegistry');

class ProviderFactory {
  constructor() {
    this.registry = providerRegistry;
  }

  /**
   * Create storage provider instance
   * @param {string} type - Provider type
   * @param {Object} config - Provider configuration
   * @returns {Promise<IStorageProvider>} - Configured provider instance
   */
  async createStorageProvider(type, config) {
    const provider = this.registry.getStorageProvider(type);
    if (!provider) {
      throw new Error(`Storage provider '${type}' not found. Available providers: ${this.registry.getAvailableStorageProviders().join(', ')}`);
    }

    // Validate configuration
    const validation = await provider.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid storage provider configuration for '${type}': ${validation.errors.join(', ')}`);
    }

    // Connect to storage
    const connected = await provider.connect(config);
    if (!connected) {
      throw new Error(`Failed to connect to storage provider '${type}'`);
    }

    console.log(`✅ Created and connected storage provider: ${type}`);
    return provider;
  }

  /**
   * Create notification provider instance
   * @param {string} type - Provider type
   * @param {Object} config - Provider configuration
   * @returns {Promise<INotificationProvider>} - Configured provider instance
   */
  async createNotificationProvider(type, config) {
    const provider = this.registry.getNotificationProvider(type);
    if (!provider) {
      throw new Error(`Notification provider '${type}' not found. Available providers: ${this.registry.getAvailableNotificationProviders().join(', ')}`);
    }

    // Validate configuration
    const validation = await provider.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid notification provider configuration for '${type}': ${validation.errors.join(', ')}`);
    }

    // Configure provider
    const configured = await provider.configure(config);
    if (!configured) {
      throw new Error(`Failed to configure notification provider '${type}'`);
    }

    console.log(`✅ Created and configured notification provider: ${type}`);
    return provider;
  }

  /**
   * Create monitor provider instance
   * @param {string} type - Provider type
   * @param {Object} config - Provider configuration
   * @returns {Promise<IFileMonitor>} - Configured provider instance
   */
  async createMonitorProvider(type, config) {
    const provider = this.registry.getMonitorProvider(type);
    if (!provider) {
      throw new Error(`Monitor provider '${type}' not found. Available providers: ${this.registry.getAvailableMonitorProviders().join(', ')}`);
    }

    // Validate configuration
    const validation = await provider.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid monitor provider configuration for '${type}': ${validation.errors.join(', ')}`);
    }

    console.log(`✅ Created monitor provider: ${type}`);
    return provider;
  }

  /**
   * Create multiple notification providers
   * @param {Array<Object>} providers - Array of provider configurations
   * @returns {Promise<Array<INotificationProvider>>} - Array of configured providers
   */
  async createNotificationProviders(providers) {
    const instances = [];
    
    for (const providerConfig of providers) {
      try {
        const { type, config, enabled = true } = providerConfig;
        
        if (!enabled) {
          console.log(`⏭️ Skipping disabled notification provider: ${type}`);
          continue;
        }

        const provider = await this.createNotificationProvider(type, config);
        instances.push(provider);
      } catch (error) {
        console.error(`❌ Failed to create notification provider: ${error.message}`);
        // Continue with other providers even if one fails
      }
    }

    console.log(`✅ Created ${instances.length} notification providers`);
    return instances;
  }

  /**
   * Test provider configuration
   * @param {string} providerType - Type of provider ('storage', 'notification', 'monitor')
   * @param {string} type - Provider type
   * @param {Object} config - Provider configuration
   * @returns {Promise<Object>} - Test result
   */
  async testProvider(providerType, type, config) {
    try {
      let provider;
      
      switch (providerType) {
        case 'storage':
          provider = this.registry.getStorageProvider(type);
          if (provider) {
            return await provider.testConnection(config);
          }
          break;
        case 'notification':
          provider = this.registry.getNotificationProvider(type);
          if (provider) {
            return await provider.testNotification(config);
          }
          break;
        case 'monitor':
          provider = this.registry.getMonitorProvider(type);
          if (provider) {
            return await provider.testMonitoring(config);
          }
          break;
        default:
          throw new Error(`Unknown provider type: ${providerType}`);
      }

      if (!provider) {
        return {
          success: false,
          error: `Provider '${type}' not found for type '${providerType}'`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get available provider types
   * @returns {Object} - Available provider types by category
   */
  getAvailableProviders() {
    return {
      storage: this.registry.getAvailableStorageProviders(),
      notification: this.registry.getAvailableNotificationProviders(),
      monitor: this.registry.getAvailableMonitorProviders()
    };
  }
}

// Create singleton instance
const providerFactory = new ProviderFactory();

module.exports = providerFactory;
