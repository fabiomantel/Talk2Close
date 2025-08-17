/**
 * Configuration Validator
 * Validates all provider configurations and system settings
 */

const { v4: uuidv4 } = require('uuid');

class ConfigurationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate folder configuration
   * @param {Object} folderConfig - Folder configuration object
   * @returns {Object} - Validation result
   */
  validateFolderConfig(folderConfig) {
    this.errors = [];
    this.warnings = [];

    // Required fields
    if (!folderConfig.id) {
      folderConfig.id = uuidv4();
      this.warnings.push('Folder ID auto-generated');
    }

    if (!folderConfig.name) {
      this.errors.push('Folder name is required');
    }

    if (!folderConfig.storage) {
      this.errors.push('Storage configuration is required');
    } else {
      this.validateStorageConfig(folderConfig.storage);
    }

    if (!folderConfig.monitor) {
      this.errors.push('Monitor configuration is required');
    } else {
      this.validateMonitorConfig(folderConfig.monitor);
    }

    if (!folderConfig.processing) {
      this.errors.push('Processing configuration is required');
    } else {
      this.validateProcessingConfig(folderConfig.processing);
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      config: folderConfig
    };
  }

  /**
   * Validate storage configuration
   * @param {Object} storageConfig - Storage configuration
   */
  validateStorageConfig(storageConfig) {
    if (!storageConfig.type) {
      this.errors.push('Storage type is required');
    }

    if (!storageConfig.config) {
      this.errors.push('Storage configuration is required');
    }

    // Validate based on storage type
    if (storageConfig.type === 's3') {
      this.validateS3Config(storageConfig.config);
    } else if (storageConfig.type === 'azure') {
      this.validateAzureConfig(storageConfig.config);
    } else if (storageConfig.type === 'gcs') {
      this.validateGCSConfig(storageConfig.config);
    } else if (storageConfig.type === 'local') {
      this.validateLocalConfig(storageConfig.config);
    }
  }

  /**
   * Validate S3 configuration
   * @param {Object} config - S3 configuration
   */
  validateS3Config(config) {
    if (!config.bucket) {
      this.errors.push('S3 bucket name is required');
    }

    if (!config.credentials) {
      this.errors.push('S3 credentials are required');
    } else {
      if (!config.credentials.accessKeyId) {
        this.errors.push('S3 access key ID is required');
      }
      if (!config.credentials.secretAccessKey) {
        this.errors.push('S3 secret access key is required');
      }
      if (!config.credentials.region) {
        this.errors.push('S3 region is required');
      }
    }
  }

  /**
   * Validate Azure configuration
   * @param {Object} config - Azure configuration
   */
  validateAzureConfig(config) {
    if (!config.accountName) {
      this.errors.push('Azure account name is required');
    }

    if (!config.containerName) {
      this.errors.push('Azure container name is required');
    }

    if (!config.accountKey) {
      this.errors.push('Azure account key is required');
    }
  }

  /**
   * Validate Google Cloud Storage configuration
   * @param {Object} config - GCS configuration
   */
  validateGCSConfig(config) {
    if (!config.bucket) {
      this.errors.push('GCS bucket name is required');
    }

    if (!config.credentials) {
      this.errors.push('GCS credentials are required');
    }
  }

  /**
   * Validate local storage configuration
   * @param {Object} config - Local configuration
   */
  validateLocalConfig(config) {
    if (!config.path) {
      this.errors.push('Local storage path is required');
    }
  }

  /**
   * Validate monitor configuration
   * @param {Object} monitorConfig - Monitor configuration
   */
  validateMonitorConfig(monitorConfig) {
    if (!monitorConfig.type) {
      this.errors.push('Monitor type is required');
    }

    if (!monitorConfig.config) {
      this.errors.push('Monitor configuration is required');
    }

    // Validate based on monitor type
    if (monitorConfig.type === 'polling') {
      this.validatePollingConfig(monitorConfig.config);
    } else if (monitorConfig.type === 'events') {
      this.validateEventsConfig(monitorConfig.config);
    } else if (monitorConfig.type === 'cloud') {
      this.validateCloudEventsConfig(monitorConfig.config);
    }
  }

  /**
   * Validate polling configuration
   * @param {Object} config - Polling configuration
   */
  validatePollingConfig(config) {
    if (config.scanInterval) {
      const interval = parseInt(config.scanInterval);
      if (isNaN(interval) || interval < 30 || interval > 3600) {
        this.errors.push('Scan interval must be between 30 and 3600 seconds');
      }
    }
  }

  /**
   * Validate events configuration
   * @param {Object} config - Events configuration
   */
  validateEventsConfig(config) {
    // Platform-specific validation could be added here
    if (!config.path) {
      this.errors.push('Events monitor path is required');
    }
  }

  /**
   * Validate cloud events configuration
   * @param {Object} config - Cloud events configuration
   */
  validateCloudEventsConfig(config) {
    if (!config.endpoint) {
      this.errors.push('Cloud events endpoint is required');
    }
  }

  /**
   * Validate processing configuration
   * @param {Object} processingConfig - Processing configuration
   */
  validateProcessingConfig(processingConfig) {
    if (processingConfig.maxFileSize) {
      const maxSize = parseInt(processingConfig.maxFileSize);
      if (isNaN(maxSize) || maxSize < 1024 * 1024 || maxSize > 2 * 1024 * 1024 * 1024) {
        this.errors.push('Max file size must be between 1MB and 2GB');
      }
    }

    if (processingConfig.allowedExtensions) {
      if (!Array.isArray(processingConfig.allowedExtensions)) {
        this.errors.push('Allowed extensions must be an array');
      } else {
        const validExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
        for (const ext of processingConfig.allowedExtensions) {
          if (!validExtensions.includes(ext.toLowerCase())) {
            this.errors.push(`Invalid file extension: ${ext}. Valid extensions: ${validExtensions.join(', ')}`);
          }
        }
      }
    }
  }

  /**
   * Validate notification configuration
   * @param {Object} notificationConfig - Notification configuration
   * @returns {Object} - Validation result
   */
  validateNotificationConfig(notificationConfig) {
    this.errors = [];
    this.warnings = [];

    if (!notificationConfig.type) {
      this.errors.push('Notification type is required');
    }

    if (!notificationConfig.config) {
      this.errors.push('Notification configuration is required');
    }

    // Validate based on notification type
    if (notificationConfig.type === 'email') {
      this.validateEmailConfig(notificationConfig.config);
    } else if (notificationConfig.type === 'slack') {
      this.validateSlackConfig(notificationConfig.config);
    } else if (notificationConfig.type === 'webhook') {
      this.validateWebhookConfig(notificationConfig.config);
    } else if (notificationConfig.type === 'sms') {
      this.validateSMSConfig(notificationConfig.config);
    }

    if (notificationConfig.conditions) {
      if (!Array.isArray(notificationConfig.conditions)) {
        this.errors.push('Notification conditions must be an array');
      } else {
        const validConditions = ['file_failed', 'batch_completed', 'batch_failed', 'file_processed'];
        for (const condition of notificationConfig.conditions) {
          if (!validConditions.includes(condition)) {
            this.errors.push(`Invalid notification condition: ${condition}. Valid conditions: ${validConditions.join(', ')}`);
          }
        }
      }
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Validate email configuration
   * @param {Object} config - Email configuration
   */
  validateEmailConfig(config) {
    if (!config.smtpHost) {
      this.errors.push('SMTP host is required for email notifications');
    }

    if (!config.smtpPort) {
      this.errors.push('SMTP port is required for email notifications');
    }

    if (!config.fromEmail) {
      this.errors.push('From email is required for email notifications');
    }

    if (!config.toEmail) {
      this.errors.push('To email is required for email notifications');
    }
  }

  /**
   * Validate Slack configuration
   * @param {Object} config - Slack configuration
   */
  validateSlackConfig(config) {
    if (!config.webhookUrl) {
      this.errors.push('Slack webhook URL is required');
    }

    if (!config.channel) {
      this.errors.push('Slack channel is required');
    }
  }

  /**
   * Validate webhook configuration
   * @param {Object} config - Webhook configuration
   */
  validateWebhookConfig(config) {
    if (!config.url) {
      this.errors.push('Webhook URL is required');
    }

    try {
      new URL(config.url);
    } catch (error) {
      this.errors.push('Invalid webhook URL format');
    }
  }

  /**
   * Validate SMS configuration
   * @param {Object} config - SMS configuration
   */
  validateSMSConfig(config) {
    if (!config.accountSid) {
      this.errors.push('SMS account SID is required');
    }

    if (!config.authToken) {
      this.errors.push('SMS auth token is required');
    }

    if (!config.fromNumber) {
      this.errors.push('SMS from number is required');
    }

    if (!config.toNumber) {
      this.errors.push('SMS to number is required');
    }
  }

  /**
   * Validate processing configuration
   * @param {Object} processingConfig - Processing configuration
   * @returns {Object} - Validation result
   */
  validateGlobalProcessingConfig(processingConfig) {
    this.errors = [];
    this.warnings = [];

    if (processingConfig.maxConcurrentFiles) {
      const maxConcurrent = parseInt(processingConfig.maxConcurrentFiles);
      if (isNaN(maxConcurrent) || maxConcurrent < 1 || maxConcurrent > 20) {
        this.errors.push('Max concurrent files must be between 1 and 20');
      }
    }

    if (processingConfig.retryConfig) {
      this.validateRetryConfig(processingConfig.retryConfig);
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Validate retry configuration
   * @param {Object} retryConfig - Retry configuration
   */
  validateRetryConfig(retryConfig) {
    if (retryConfig.maxRetries !== undefined) {
      const maxRetries = parseInt(retryConfig.maxRetries);
      if (isNaN(maxRetries) || maxRetries < 0 || maxRetries > 10) {
        this.errors.push('Max retries must be between 0 and 10');
      }
    }

    if (retryConfig.delaySeconds) {
      const delay = parseInt(retryConfig.delaySeconds);
      if (isNaN(delay) || delay < 1 || delay > 3600) {
        this.errors.push('Retry delay must be between 1 and 3600 seconds');
      }
    }
  }

  /**
   * Validate UUID format
   * @param {string} uuid - UUID string to validate
   * @returns {boolean} - True if valid UUID
   */
  validateUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate file name format (UUID pattern)
   * @param {string} fileName - File name to validate
   * @returns {boolean} - True if valid UUID format
   */
  validateFileNameFormat(fileName) {
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    return this.validateUUID(nameWithoutExtension);
  }
}

module.exports = ConfigurationValidator;
