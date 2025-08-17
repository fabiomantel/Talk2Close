/**
 * Webhook Notification Provider
 * Implements INotificationProvider interface for HTTP webhook notifications
 */

const INotificationProvider = require('../../interfaces/INotificationProvider');
const https = require('https');
const http = require('http');
const { URL } = require('url');

class WebhookNotificationProvider extends INotificationProvider {
  constructor() {
    super();
    this.configured = false;
    this.config = null;
  }

  /**
   * Get provider type identifier
   * @returns {string} - Provider type
   */
  getType() {
    return 'webhook';
  }

  /**
   * Configure notification provider
   * @param {Object} config - Provider configuration
   * @returns {Promise<boolean>} - Configuration success status
   */
  async configure(config) {
    try {
      console.log(`🔧 Configuring webhook notification provider`);

      // Validate configuration
      const validation = await this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid webhook configuration: ${validation.errors.join(', ')}`);
      }

      this.config = config;
      this.configured = true;

      console.log(`✅ Configured webhook notification provider`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to configure webhook notification provider: ${error.message}`);
      this.configured = false;
      return false;
    }
  }

  /**
   * Send notification through webhook
   * @param {Object} notification - Notification object
   * @returns {Promise<Object>} - Send result
   */
  async sendNotification(notification) {
    try {
      if (!this.configured) {
        throw new Error('Webhook notification provider not configured');
      }

      console.log(`📤 Sending webhook notification to: ${this.config.url}`);

      const payload = this.buildPayload(notification);
      const result = await this.sendWebhook(payload);

      console.log(`✅ Webhook notification sent successfully`);
      return {
        success: true,
        provider: 'webhook',
        sentAt: new Date(),
        response: result
      };

    } catch (error) {
      console.error(`❌ Failed to send webhook notification: ${error.message}`);
      return {
        success: false,
        provider: 'webhook',
        error: error.message,
        sentAt: new Date()
      };
    }
  }

  /**
   * Validate provider-specific configuration
   * @param {Object} config - Configuration to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateConfig(config) {
    const errors = [];

    if (!config.url) {
      errors.push('Webhook URL is required');
    } else {
      try {
        const url = new URL(config.url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('Webhook URL must use HTTP or HTTPS protocol');
        }
      } catch (error) {
        errors.push('Invalid webhook URL format');
      }
    }

    // Validate timeout if specified
    if (config.timeout) {
      const timeout = parseInt(config.timeout);
      if (isNaN(timeout) || timeout < 1000 || timeout > 30000) {
        errors.push('Timeout must be between 1000 and 30000 milliseconds');
      }
    }

    // Validate retry configuration if specified
    if (config.retries) {
      const retries = parseInt(config.retries);
      if (isNaN(retries) || retries < 0 || retries > 5) {
        errors.push('Retries must be between 0 and 5');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Test notification delivery
   * @param {Object} config - Provider configuration
   * @returns {Promise<Object>} - Test result
   */
  async testNotification(config) {
    try {
      console.log(`🧪 Testing webhook notification: ${config.url}`);

      const validation = await this.validateConfig(config);
      if (!validation.valid) {
        return {
          success: false,
          error: `Configuration validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Send test notification
      const testNotification = {
        condition: 'test',
        data: {
          message: 'This is a test notification from Talk2Close batch processing system',
          timestamp: new Date().toISOString(),
          test: true
        },
        timestamp: new Date().toISOString()
      };

      const result = await this.sendWebhook(this.buildPayload(testNotification), config);

      return {
        success: true,
        message: 'Webhook notification test successful',
        details: {
          url: config.url,
          response: result
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if provider is enabled
   * @returns {boolean} - Provider enabled status
   */
  isEnabled() {
    return this.configured && this.config && this.config.enabled !== false;
  }

  /**
   * Build webhook payload
   * @param {Object} notification - Notification object
   * @returns {Object} - Webhook payload
   */
  buildPayload(notification) {
    const basePayload = {
      provider: 'talk2close',
      version: '1.0',
      timestamp: notification.timestamp || new Date().toISOString(),
      condition: notification.condition,
      data: notification.data
    };

    // Add custom headers if specified
    if (this.config && this.config.headers) {
      basePayload.headers = this.config.headers;
    }

    // Add custom payload structure if specified
    if (this.config && this.config.payloadTemplate) {
      return this.applyPayloadTemplate(basePayload, this.config.payloadTemplate);
    }

    return basePayload;
  }

  /**
   * Apply custom payload template
   * @param {Object} basePayload - Base payload
   * @param {Object} template - Payload template
   * @returns {Object} - Customized payload
   */
  applyPayloadTemplate(basePayload, template) {
    // Simple template substitution
    let payload = JSON.stringify(basePayload);
    
    Object.keys(template).forEach(key => {
      const value = template[key];
      if (typeof value === 'string') {
        payload = payload.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }
    });

    try {
      return JSON.parse(payload);
    } catch (error) {
      console.warn('Failed to parse custom payload template, using base payload');
      return basePayload;
    }
  }

  /**
   * Send webhook HTTP request
   * @param {Object} payload - Request payload
   * @param {Object} config - Configuration (optional, uses instance config if not provided)
   * @returns {Promise<Object>} - Response result
   */
  async sendWebhook(payload, config = null) {
    const webhookConfig = config || this.config;
    
    return new Promise((resolve, reject) => {
      const url = new URL(webhookConfig.url);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const postData = JSON.stringify(payload);
      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Talk2Close-BatchProcessor/1.0'
      };

      // Add custom headers if specified
      if (webhookConfig.headers) {
        Object.assign(headers, webhookConfig.headers);
      }

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: headers,
        timeout: webhookConfig.timeout || 10000
      };

      const req = client.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          };

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`Webhook request failed with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Webhook request failed: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Webhook request timed out'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Send webhook with retry logic
   * @param {Object} payload - Request payload
   * @param {Object} config - Configuration
   * @returns {Promise<Object>} - Response result
   */
  async sendWebhookWithRetry(payload, config = null) {
    const webhookConfig = config || this.config;
    const maxRetries = webhookConfig.retries || 0;
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.sendWebhook(payload, webhookConfig);
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Webhook attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Get provider configuration
   * @returns {Object|null} - Current configuration
   */
  getConfiguration() {
    return this.config;
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   * @returns {Promise<boolean>} - Update success status
   */
  async updateConfiguration(newConfig) {
    return await this.configure(newConfig);
  }
}

module.exports = WebhookNotificationProvider;
