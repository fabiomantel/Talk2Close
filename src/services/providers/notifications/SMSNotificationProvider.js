const INotificationProvider = require('../../interfaces/INotificationProvider');

/**
 * SMS Notification Provider
 * Sends SMS notifications via Twilio
 */
class SMSNotificationProvider extends INotificationProvider {
  constructor() {
    super();
    this.name = 'sms';
    this.description = 'Send SMS notifications via Twilio';
  }

  /**
   * Configure the SMS notification provider
   * @param {Object} config - Configuration object
   * @returns {Promise<Object>} - Configuration result
   */
  async configure(config) {
    try {
      console.log('🔧 Configuring SMS notification provider');

      // Validate configuration
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid SMS configuration: ${validation.errors.join(', ')}`
        };
      }

      this.config = config;
      
      return {
        success: true,
        message: 'SMS notification provider configured successfully'
      };

    } catch (error) {
      console.error('❌ Failed to configure SMS notification provider:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send notification via SMS
   * @param {Object} notification - Notification object
   * @returns {Promise<Object>} - Send result
   */
  async sendNotification(notification) {
    try {
      console.log('📤 Sending SMS notification');

      if (!this.config) {
        throw new Error('SMS notification provider not configured');
      }

      // Prepare SMS message
      let message = notification.message;
      
      // Add title if available
      if (notification.title) {
        message = `${notification.title}: ${message}`;
      }

      // Truncate message if too long (SMS limit is 160 characters)
      if (message.length > 160) {
        message = message.substring(0, 157) + '...';
      }

      // Send SMS via Twilio
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')
        },
        body: new URLSearchParams({
          From: this.config.fromNumber,
          To: this.config.toNumber,
          Body: message
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Twilio SMS request failed: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const result = await response.json();
      
      console.log('✅ SMS notification sent successfully');
      return {
        success: true,
        message: 'SMS notification sent successfully',
        provider: 'sms',
        messageId: result.sid
      };

    } catch (error) {
      console.error('❌ Failed to send SMS notification:', error);
      return {
        success: false,
        error: error.message,
        provider: 'sms'
      };
    }
  }

  /**
   * Validate SMS configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validation result
   */
  validateConfig(config) {
    const errors = [];

    if (!config.accountSid) {
      errors.push('Account SID is required');
    } else if (!config.accountSid.startsWith('AC')) {
      errors.push('Account SID must start with AC');
    }

    if (!config.authToken) {
      errors.push('Auth token is required');
    }

    if (!config.fromNumber) {
      errors.push('From number is required');
    } else if (!this.isValidPhoneNumber(config.fromNumber)) {
      errors.push('Invalid from number format');
    }

    if (!config.toNumber) {
      errors.push('To number is required');
    } else if (!this.isValidPhoneNumber(config.toNumber)) {
      errors.push('Invalid to number format');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} - True if valid
   */
  isValidPhoneNumber(phoneNumber) {
    // Basic phone number validation (E.164 format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Test the SMS notification provider
   * @param {Object} config - Configuration to test
   * @returns {Promise<Object>} - Test result
   */
  async testNotification(config) {
    try {
      console.log('🧪 Testing SMS notification provider');

      // Configure provider
      const configureResult = await this.configure(config);
      if (!configureResult.success) {
        return configureResult;
      }

      // Send test notification
      const testNotification = {
        type: 'info',
        title: 'Test SMS',
        message: 'This is a test SMS from the Hebrew Sales Call Analysis system.'
      };

      const sendResult = await this.sendNotification(testNotification);
      
      if (sendResult.success) {
        return {
          success: true,
          message: 'SMS notification provider test successful'
        };
      } else {
        return {
          success: false,
          error: `SMS notification test failed: ${sendResult.error}`
        };
      }

    } catch (error) {
      console.error('❌ SMS notification provider test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = SMSNotificationProvider;
