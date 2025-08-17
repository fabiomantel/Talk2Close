const INotificationProvider = require('../../interfaces/INotificationProvider');

/**
 * Slack Notification Provider
 * Sends notifications to Slack channels via webhooks
 */
class SlackNotificationProvider extends INotificationProvider {
  constructor() {
    super();
    this.name = 'slack';
    this.description = 'Send notifications to Slack channels via webhooks';
  }

  /**
   * Configure the Slack notification provider
   * @param {Object} config - Configuration object
   * @returns {Promise<Object>} - Configuration result
   */
  async configure(config) {
    try {
      console.log('🔧 Configuring Slack notification provider');

      // Validate configuration
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid Slack configuration: ${validation.errors.join(', ')}`
        };
      }

      this.config = config;
      
      return {
        success: true,
        message: 'Slack notification provider configured successfully'
      };

    } catch (error) {
      console.error('❌ Failed to configure Slack notification provider:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send notification via Slack
   * @param {Object} notification - Notification object
   * @returns {Promise<Object>} - Send result
   */
  async sendNotification(notification) {
    try {
      console.log('📤 Sending Slack notification');

      if (!this.config) {
        throw new Error('Slack notification provider not configured');
      }

      // Prepare Slack message
      const slackMessage = {
        channel: this.config.channel || '#general',
        text: notification.message,
        attachments: []
      };

      // Add rich formatting if available
      if (notification.title) {
        slackMessage.attachments.push({
          title: notification.title,
          text: notification.message,
          color: this.getColorForType(notification.type),
          fields: []
        });
      }

      // Add fields if available
      if (notification.fields) {
        slackMessage.attachments[0].fields = notification.fields.map(field => ({
          title: field.name,
          value: field.value,
          short: field.short !== false
        }));
      }

      // Send to Slack webhook
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackMessage)
      });

      if (!response.ok) {
        throw new Error(`Slack webhook request failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Slack notification sent successfully');
      return {
        success: true,
        message: 'Slack notification sent successfully',
        provider: 'slack'
      };

    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error);
      return {
        success: false,
        error: error.message,
        provider: 'slack'
      };
    }
  }

  /**
   * Validate Slack configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validation result
   */
  validateConfig(config) {
    const errors = [];

    if (!config.webhookUrl) {
      errors.push('Webhook URL is required');
    } else {
      try {
        new URL(config.webhookUrl);
      } catch (error) {
        errors.push('Invalid webhook URL format');
      }
    }

    if (!config.channel) {
      errors.push('Channel is required');
    } else if (!config.channel.startsWith('#')) {
      errors.push('Channel must start with #');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get color for notification type
   * @param {string} type - Notification type
   * @returns {string} - Slack color
   */
  getColorForType(type) {
    switch (type) {
      case 'success':
        return 'good';
      case 'warning':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return '#36a64f';
    }
  }

  /**
   * Test the Slack notification provider
   * @param {Object} config - Configuration to test
   * @returns {Promise<Object>} - Test result
   */
  async testNotification(config) {
    try {
      console.log('🧪 Testing Slack notification provider');

      // Configure provider
      const configureResult = await this.configure(config);
      if (!configureResult.success) {
        return configureResult;
      }

      // Send test notification
      const testNotification = {
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification from the Hebrew Sales Call Analysis system.',
        fields: [
          { name: 'Provider', value: 'Slack', short: true },
          { name: 'Timestamp', value: new Date().toISOString(), short: true }
        ]
      };

      const sendResult = await this.sendNotification(testNotification);
      
      if (sendResult.success) {
        return {
          success: true,
          message: 'Slack notification provider test successful'
        };
      } else {
        return {
          success: false,
          error: `Slack notification test failed: ${sendResult.error}`
        };
      }

    } catch (error) {
      console.error('❌ Slack notification provider test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = SlackNotificationProvider;
