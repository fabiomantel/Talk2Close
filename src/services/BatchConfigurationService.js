/**
 * Batch Configuration Management Service
 * Handles all configuration operations for the multi-file processing system
 */

const { prisma } = require('../database/connection');
const ConfigurationValidator = require('./ConfigurationValidator');
const providerFactory = require('./ProviderFactory');

class BatchConfigurationService {
  constructor() {
    this.validator = new ConfigurationValidator();
    this.defaultGlobalConfig = {
      maxConcurrentFiles: 5,
      retryConfig: {
        enabled: true,
        maxRetries: 3,
        delaySeconds: 60,
        exponentialBackoff: true
      },
      autoStart: true,
      immediateProcessing: true,
      backgroundProcessing: true
    };
  }

  /**
   * Create external folder configuration
   * @param {Object} folderConfig - Folder configuration
   * @returns {Promise<Object>} - Created folder
   */
  async createExternalFolder(folderConfig) {
    try {
      console.log(`📁 Creating external folder: ${folderConfig.name}`);

      // Validate configuration
      const validation = this.validator.validateFolderConfig(folderConfig);
      if (!validation.valid) {
        throw new Error(`Invalid folder configuration: ${validation.errors.join(', ')}`);
      }

      // Test storage provider connection
      const storageTest = await providerFactory.testProvider(
        'storage',
        folderConfig.storage.type,
        folderConfig.storage.config
      );

      if (!storageTest.success) {
        throw new Error(`Storage provider test failed: ${storageTest.error}`);
      }

      // Test monitor provider configuration
      const monitorTest = await providerFactory.testProvider(
        'monitor',
        folderConfig.monitor.type,
        folderConfig.monitor.config
      );

      if (!monitorTest.success) {
        throw new Error(`Monitor provider test failed: ${monitorTest.error}`);
      }

      // Create folder
      const folder = await prisma.externalFolder.create({
        data: {
          name: folderConfig.name,
          storageConfig: folderConfig.storage,
          monitorConfig: folderConfig.monitor,
          processingConfig: folderConfig.processing,
          isActive: true
        }
      });

      console.log(`✅ Created external folder ID: ${folder.id}`);
      return folder;

    } catch (error) {
      console.error(`❌ Failed to create external folder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update external folder configuration
   * @param {number} folderId - Folder ID
   * @param {Object} updates - Configuration updates
   * @returns {Promise<Object>} - Updated folder
   */
  async updateExternalFolder(folderId, updates) {
    try {
      console.log(`📝 Updating external folder ID: ${folderId}`);

      // Get existing folder
      const existingFolder = await prisma.externalFolder.findUnique({
        where: { id: folderId }
      });

      if (!existingFolder) {
        throw new Error(`External folder with ID ${folderId} not found`);
      }

      // Merge updates with existing configuration
      const updatedConfig = {
        ...existingFolder,
        ...updates,
        storageConfig: updates.storage || existingFolder.storageConfig,
        monitorConfig: updates.monitor || existingFolder.monitorConfig,
        processingConfig: updates.processing || existingFolder.processingConfig
      };

      // Validate updated configuration
      const validation = this.validator.validateFolderConfig(updatedConfig);
      if (!validation.valid) {
        throw new Error(`Invalid folder configuration: ${validation.errors.join(', ')}`);
      }

      // Test providers if configuration changed
      if (updates.storage) {
        const storageTest = await providerFactory.testProvider(
          'storage',
          updates.storage.type,
          updates.storage.config
        );

        if (!storageTest.success) {
          throw new Error(`Storage provider test failed: ${storageTest.error}`);
        }
      }

      if (updates.monitor) {
        const monitorTest = await providerFactory.testProvider(
          'monitor',
          updates.monitor.type,
          updates.monitor.config
        );

        if (!monitorTest.success) {
          throw new Error(`Monitor provider test failed: ${monitorTest.error}`);
        }
      }

      // Update folder
      const folder = await prisma.externalFolder.update({
        where: { id: folderId },
        data: {
          name: updates.name || existingFolder.name,
          storageConfig: updatedConfig.storageConfig,
          monitorConfig: updatedConfig.monitorConfig,
          processingConfig: updatedConfig.processingConfig,
          isActive: updates.isActive !== undefined ? updates.isActive : existingFolder.isActive
        }
      });

      console.log(`✅ Updated external folder ID: ${folder.id}`);
      return folder;

    } catch (error) {
      console.error(`❌ Failed to update external folder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete external folder configuration
   * @param {number} folderId - Folder ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteExternalFolder(folderId) {
    try {
      console.log(`🗑️ Deleting external folder ID: ${folderId}`);

      // Check if folder has active batch jobs
      const activeJobs = await prisma.batchJob.findMany({
        where: {
          folderId: folderId,
          status: { in: ['pending', 'running'] }
        }
      });

      if (activeJobs.length > 0) {
        throw new Error(`Cannot delete folder with ${activeJobs.length} active batch jobs`);
      }

      // Delete folder (cascade will delete batch jobs and file records)
      await prisma.externalFolder.delete({
        where: { id: folderId }
      });

      console.log(`✅ Deleted external folder ID: ${folderId}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to delete external folder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get external folder by ID
   * @param {number} folderId - Folder ID
   * @returns {Promise<Object>} - Folder configuration
   */
  async getExternalFolder(folderId) {
    try {
      const folder = await prisma.externalFolder.findUnique({
        where: { id: folderId },
        include: {
          batchJobs: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!folder) {
        throw new Error(`External folder with ID ${folderId} not found`);
      }

      return folder;

    } catch (error) {
      console.error(`❌ Failed to get external folder: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all external folders
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Folders with pagination
   */
  async listExternalFolders(options = {}) {
    try {
      const { page = 1, limit = 10, activeOnly = false } = options;
      const offset = (page - 1) * limit;

      const where = {};
      if (activeOnly) {
        where.isActive = true;
      }

      const [folders, total] = await Promise.all([
        prisma.externalFolder.findMany({
          where,
          include: {
            _count: {
              select: {
                batchJobs: true
              }
            },
            batchJobs: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: parseInt(limit)
        }),
        prisma.externalFolder.count({ where })
      ]);

      return {
        folders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error(`❌ Failed to list external folders: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test external folder configuration
   * @param {number} folderId - Folder ID
   * @returns {Promise<Object>} - Test results
   */
  async testExternalFolder(folderId) {
    try {
      console.log(`🧪 Testing external folder ID: ${folderId}`);

      const folder = await this.getExternalFolder(folderId);

      const results = {
        folderId,
        folderName: folder.name,
        tests: {}
      };

      // Test storage provider
      try {
        const storageTest = await providerFactory.testProvider(
          'storage',
          folder.storageConfig.type,
          folder.storageConfig.config
        );
        results.tests.storage = storageTest;
      } catch (error) {
        results.tests.storage = {
          success: false,
          error: error.message
        };
      }

      // Test monitor provider
      try {
        const monitorTest = await providerFactory.testProvider(
          'monitor',
          folder.monitorConfig.type,
          folder.monitorConfig.config
        );
        results.tests.monitor = monitorTest;
      } catch (error) {
        results.tests.monitor = {
          success: false,
          error: error.message
        };
      }

      // Overall test result
      results.success = results.tests.storage.success && results.tests.monitor.success;

      console.log(`✅ Folder test completed: ${results.success ? 'PASSED' : 'FAILED'}`);
      return results;

    } catch (error) {
      console.error(`❌ Failed to test external folder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create notification configuration
   * @param {Object} notificationConfig - Notification configuration
   * @returns {Promise<Object>} - Created notification config
   */
  async createNotificationConfig(notificationConfig) {
    try {
      console.log(`🔔 Creating notification config: ${notificationConfig.name}`);

      // Validate configuration
      const validation = this.validator.validateNotificationConfig(notificationConfig);
      if (!validation.valid) {
        throw new Error(`Invalid notification configuration: ${validation.errors.join(', ')}`);
      }

      // Test notification provider
      const testResult = await providerFactory.testProvider(
        'notification',
        notificationConfig.type,
        notificationConfig.config
      );

      if (!testResult.success) {
        throw new Error(`Notification provider test failed: ${testResult.error}`);
      }

      // Create notification config
      const config = await prisma.notificationConfig.create({
        data: {
          type: notificationConfig.type,
          name: notificationConfig.name,
          config: notificationConfig.config,
          conditions: notificationConfig.conditions || [],
          isActive: true
        }
      });

      console.log(`✅ Created notification config ID: ${config.id}`);
      return config;

    } catch (error) {
      console.error(`❌ Failed to create notification config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update notification configuration
   * @param {number} configId - Configuration ID
   * @param {Object} updates - Configuration updates
   * @returns {Promise<Object>} - Updated notification config
   */
  async updateNotificationConfig(configId, updates) {
    try {
      console.log(`📝 Updating notification config ID: ${configId}`);

      // Get existing config
      const existingConfig = await prisma.notificationConfig.findUnique({
        where: { id: configId }
      });

      if (!existingConfig) {
        throw new Error(`Notification config with ID ${configId} not found`);
      }

      // Merge updates
      const updatedConfig = {
        ...existingConfig,
        ...updates
      };

      // Validate updated configuration
      const validation = this.validator.validateNotificationConfig(updatedConfig);
      if (!validation.valid) {
        throw new Error(`Invalid notification configuration: ${validation.errors.join(', ')}`);
      }

      // Test provider if config changed
      if (updates.config) {
        const testResult = await providerFactory.testProvider(
          'notification',
          updatedConfig.type,
          updates.config
        );

        if (!testResult.success) {
          throw new Error(`Notification provider test failed: ${testResult.error}`);
        }
      }

      // Update config
      const config = await prisma.notificationConfig.update({
        where: { id: configId },
        data: {
          type: updates.type || existingConfig.type,
          name: updates.name || existingConfig.name,
          config: updates.config || existingConfig.config,
          conditions: updates.conditions || existingConfig.conditions,
          isActive: updates.isActive !== undefined ? updates.isActive : existingConfig.isActive
        }
      });

      console.log(`✅ Updated notification config ID: ${config.id}`);
      return config;

    } catch (error) {
      console.error(`❌ Failed to update notification config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete notification configuration
   * @param {number} configId - Configuration ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteNotificationConfig(configId) {
    try {
      console.log(`🗑️ Deleting notification config ID: ${configId}`);

      await prisma.notificationConfig.delete({
        where: { id: configId }
      });

      console.log(`✅ Deleted notification config ID: ${configId}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to delete notification config: ${error.message}`);
      throw error;
    }
  }

  /**
   * List notification configurations
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Configurations with pagination
   */
  async listNotificationConfigs(options = {}) {
    try {
      const { page = 1, limit = 10, activeOnly = false } = options;
      const offset = (page - 1) * limit;

      const where = {};
      if (activeOnly) {
        where.isActive = true;
      }

      const [configs, total] = await Promise.all([
        prisma.notificationConfig.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: parseInt(limit)
        }),
        prisma.notificationConfig.count({ where })
      ]);

      return {
        configs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error(`❌ Failed to list notification configs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test notification configuration
   * @param {number} configId - Configuration ID
   * @returns {Promise<Object>} - Test result
   */
  async testNotificationConfig(configId) {
    try {
      console.log(`🧪 Testing notification config ID: ${configId}`);

      const config = await prisma.notificationConfig.findUnique({
        where: { id: configId }
      });

      if (!config) {
        throw new Error(`Notification config with ID ${configId} not found`);
      }

      const testResult = await providerFactory.testProvider(
        'notification',
        config.type,
        config.config
      );

      console.log(`✅ Notification test completed: ${testResult.success ? 'PASSED' : 'FAILED'}`);
      return testResult;

    } catch (error) {
      console.error(`❌ Failed to test notification config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get system configuration summary
   * @returns {Promise<Object>} - Configuration summary
   */
  async getConfigurationSummary() {
    try {
      const [folders, notifications, batchJobs] = await Promise.all([
        prisma.externalFolder.count(),
        prisma.notificationConfig.count(),
        prisma.batchJob.count()
      ]);

      const activeFolders = await prisma.externalFolder.count({
        where: { isActive: true }
      });

      const activeNotifications = await prisma.notificationConfig.count({
        where: { isActive: true }
      });

      const recentJobs = await prisma.batchJob.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      return {
        folders: {
          total: folders,
          active: activeFolders
        },
        notifications: {
          total: notifications,
          active: activeNotifications
        },
        batchJobs: {
          total: batchJobs,
          recent24h: recentJobs
        },
        availableProviders: providerFactory.getAvailableProviders()
      };

    } catch (error) {
      console.error(`❌ Failed to get configuration summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get global batch processing configuration
   * @returns {Promise<Object>} - Global configuration
   */
  async getGlobalConfiguration() {
    try {
      // For now, return default configuration
      // In the future, this could be stored in database or config file
      return this.defaultGlobalConfig;
    } catch (error) {
      console.error(`❌ Failed to get global configuration: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update global batch processing configuration
   * @param {Object} config - New configuration
   * @returns {Promise<Object>} - Updated configuration
   */
  async updateGlobalConfiguration(config) {
    try {
      console.log('📝 Updating global batch processing configuration');

      // Validate configuration
      if (config.maxConcurrentFiles && (config.maxConcurrentFiles < 1 || config.maxConcurrentFiles > 20)) {
        throw new Error('Max concurrent files must be between 1 and 20');
      }

      if (config.retryConfig) {
        if (config.retryConfig.maxRetries && (config.retryConfig.maxRetries < 0 || config.retryConfig.maxRetries > 10)) {
          throw new Error('Max retries must be between 0 and 10');
        }

        if (config.retryConfig.delaySeconds && (config.retryConfig.delaySeconds < 10 || config.retryConfig.delaySeconds > 300)) {
          throw new Error('Delay seconds must be between 10 and 300');
        }
      }

      // Merge with existing configuration
      const updatedConfig = {
        ...this.defaultGlobalConfig,
        ...config,
        retryConfig: {
          ...this.defaultGlobalConfig.retryConfig,
          ...config.retryConfig
        }
      };

      // Update default config (in memory for now)
      this.defaultGlobalConfig = updatedConfig;

      console.log('✅ Global configuration updated successfully');
      return updatedConfig;

    } catch (error) {
      console.error(`❌ Failed to update global configuration: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new BatchConfigurationService();
