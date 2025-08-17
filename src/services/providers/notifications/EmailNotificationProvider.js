/**
 * Email Notification Provider
 * Implements INotificationProvider interface for email notifications
 */

const INotificationProvider = require('../../interfaces/INotificationProvider');
const nodemailer = require('nodemailer');

class EmailNotificationProvider extends INotificationProvider {
  constructor() {
    super();
    this.transporter = null;
    this.config = null;
    this.enabled = false;
  }

  /**
   * Configure email provider
   * @param {Object} config - Email configuration
   * @param {string} config.host - SMTP host
   * @param {number} config.port - SMTP port
   * @param {boolean} config.secure - Use SSL/TLS
   * @param {Object} config.auth - Authentication
   * @param {string} config.auth.user - SMTP username
   * @param {string} config.auth.pass - SMTP password
   * @param {string} config.from - From email address
   * @param {Array} config.to - Default recipients
   * @param {string} config.subject - Default subject template
   */
  async configure(config) {
    try {
      this.config = config;
      
      // Create transporter
      this.transporter = nodemailer.createTransporter({
        host: config.host,
        port: config.port,
        secure: config.secure || false,
        auth: {
          user: config.auth.user,
          pass: config.auth.pass
        }
      });

      // Test connection
      await this.transporter.verify();
      
      this.enabled = true;
      console.log(`✅ Email provider configured: ${config.host}:${config.port}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to configure email provider:', error.message);
      this.enabled = false;
      throw new Error(`Email configuration failed: ${error.message}`);
    }
  }

  /**
   * Send email notification
   * @param {Object} notification - Notification object
   * @param {string} notification.subject - Email subject
   * @param {string} notification.message - Email message
   * @param {Array} notification.recipients - Recipient emails
   * @param {string} notification.type - Notification type
   * @param {Object} notification.data - Additional data
   * @returns {Promise<Object>} - Send result
   */
  async sendNotification(notification) {
    try {
      if (!this.enabled || !this.transporter) {
        throw new Error('Email provider not configured');
      }

      const {
        subject = this.config.subject || 'System Notification',
        message,
        recipients = this.config.to || [],
        type = 'general',
        data = {}
      } = notification;

      if (!recipients || recipients.length === 0) {
        throw new Error('No recipients specified');
      }

      if (!message) {
        throw new Error('No message content specified');
      }

      // Build email content
      const emailContent = this.buildEmailContent(type, message, data);
      
      const mailOptions = {
        from: this.config.from,
        to: recipients.join(', '),
        subject: this.buildSubject(subject, type, data),
        html: emailContent.html,
        text: emailContent.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent: ${result.messageId} to ${recipients.join(', ')}`);
      
      return {
        success: true,
        messageId: result.messageId,
        recipients: recipients,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to send email notification:', error.message);
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  /**
   * Validate email configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validation result
   */
  validateConfig(config) {
    const errors = [];

    if (!config.host) {
      errors.push('SMTP host is required');
    }

    if (!config.port) {
      errors.push('SMTP port is required');
    } else if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
      errors.push('SMTP port must be a valid port number (1-65535)');
    }

    if (!config.auth) {
      errors.push('SMTP authentication is required');
    } else {
      if (!config.auth.user) {
        errors.push('SMTP username is required');
      }
      if (!config.auth.pass) {
        errors.push('SMTP password is required');
      }
    }

    if (!config.from) {
      errors.push('From email address is required');
    } else if (!this.isValidEmail(config.from)) {
      errors.push('Invalid from email address format');
    }

    if (config.to && Array.isArray(config.to)) {
      config.to.forEach(email => {
        if (!this.isValidEmail(email)) {
          errors.push(`Invalid recipient email format: ${email}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get provider type
   * @returns {string} - Provider type
   */
  getType() {
    return 'email';
  }

  /**
   * Test email notification
   * @param {Object} config - Email configuration
   * @returns {Promise<Object>} - Test result
   */
  async testNotification(config) {
    try {
      const tempTransporter = nodemailer.createTransporter({
        host: config.host,
        port: config.port,
        secure: config.secure || false,
        auth: {
          user: config.auth.user,
          pass: config.auth.pass
        }
      });

      // Test connection
      await tempTransporter.verify();

      // Send test email
      const testResult = await tempTransporter.sendMail({
        from: config.from,
        to: config.to?.[0] || config.auth.user, // Send to first recipient or self
        subject: 'Test Email - Hebrew Sales Call Analysis System',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email from the Hebrew Sales Call Analysis System.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${config.host}</li>
            <li>Port: ${config.port}</li>
            <li>Secure: ${config.secure || false}</li>
            <li>From: ${config.from}</li>
          </ul>
          <p>If you receive this email, the email notification system is working correctly.</p>
        `,
        text: `
          Test Email - Hebrew Sales Call Analysis System
          
          This is a test email from the Hebrew Sales Call Analysis System.
          
          Configuration:
          - Host: ${config.host}
          - Port: ${config.port}
          - Secure: ${config.secure || false}
          - From: ${config.from}
          
          If you receive this email, the email notification system is working correctly.
        `
      });

      return {
        success: true,
        message: 'Email test successful',
        messageId: testResult.messageId,
        details: {
          host: config.host,
          port: config.port,
          secure: config.secure || false,
          from: config.from,
          recipients: config.to || []
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Email test failed: ${error.message}`,
        error: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Check if provider is enabled
   * @returns {boolean} - Enabled status
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Build email content based on notification type
   * @param {string} type - Notification type
   * @param {string} message - Base message
   * @param {Object} data - Additional data
   * @returns {Object} - Email content
   */
  buildEmailContent(type, message, data) {
    const baseHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hebrew Sales Call Analysis System</h2>
          <div style="background-color: white; padding: 20px; border-radius: 5px; border-left: 4px solid #007bff;">
            ${message}
          </div>
        </div>
      </div>
    `;

    const baseText = `Hebrew Sales Call Analysis System\n\n${message}`;

    switch (type) {
      case 'batch_completed':
        return {
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                <h2 style="color: #333; margin-bottom: 20px;">Batch Processing Completed</h2>
                <div style="background-color: white; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745;">
                  <p><strong>Batch Job:</strong> ${data.batchJobName || 'Unknown'}</p>
                  <p><strong>Status:</strong> ${data.status || 'Completed'}</p>
                  <p><strong>Files Processed:</strong> ${data.processedFiles || 0}</p>
                  <p><strong>Files Failed:</strong> ${data.failedFiles || 0}</p>
                  <p><strong>Completion Time:</strong> ${data.completionTime || new Date().toISOString()}</p>
                  ${data.errorSummary ? `<p><strong>Error Summary:</strong> ${data.errorSummary}</p>` : ''}
                </div>
              </div>
            </div>
          `,
          text: `
            Batch Processing Completed
            
            Batch Job: ${data.batchJobName || 'Unknown'}
            Status: ${data.status || 'Completed'}
            Files Processed: ${data.processedFiles || 0}
            Files Failed: ${data.failedFiles || 0}
            Completion Time: ${data.completionTime || new Date().toISOString()}
            ${data.errorSummary ? `Error Summary: ${data.errorSummary}` : ''}
          `
        };

      case 'file_failed':
        return {
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                <h2 style="color: #333; margin-bottom: 20px;">File Processing Failed</h2>
                <div style="background-color: white; padding: 20px; border-radius: 5px; border-left: 4px solid #dc3545;">
                  <p><strong>File:</strong> ${data.fileName || 'Unknown'}</p>
                  <p><strong>Error:</strong> ${data.error || 'Unknown error'}</p>
                  <p><strong>Retry Count:</strong> ${data.retryCount || 0}</p>
                  <p><strong>Timestamp:</strong> ${data.timestamp || new Date().toISOString()}</p>
                </div>
              </div>
            </div>
          `,
          text: `
            File Processing Failed
            
            File: ${data.fileName || 'Unknown'}
            Error: ${data.error || 'Unknown error'}
            Retry Count: ${data.retryCount || 0}
            Timestamp: ${data.timestamp || new Date().toISOString()}
          `
        };

      case 'system_alert':
        return {
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                <h2 style="color: #333; margin-bottom: 20px;">System Alert</h2>
                <div style="background-color: white; padding: 20px; border-radius: 5px; border-left: 4px solid #ffc107;">
                  <p><strong>Alert Level:</strong> ${data.level || 'Warning'}</p>
                  <p><strong>Message:</strong> ${message}</p>
                  <p><strong>Timestamp:</strong> ${data.timestamp || new Date().toISOString()}</p>
                  ${data.details ? `<p><strong>Details:</strong> ${data.details}</p>` : ''}
                </div>
              </div>
            </div>
          `,
          text: `
            System Alert
            
            Alert Level: ${data.level || 'Warning'}
            Message: ${message}
            Timestamp: ${data.timestamp || new Date().toISOString()}
            ${data.details ? `Details: ${data.details}` : ''}
          `
        };

      default:
        return {
          html: baseHtml,
          text: baseText
        };
    }
  }

  /**
   * Build email subject
   * @param {string} subject - Base subject
   * @param {string} type - Notification type
   * @param {Object} data - Additional data
   * @returns {string} - Formatted subject
   */
  buildSubject(subject, type, data) {
    const prefix = '[Hebrew Sales Call Analysis]';
    
    switch (type) {
      case 'batch_completed':
        return `${prefix} Batch Processing Completed - ${data.batchJobName || 'Unknown Job'}`;
      case 'file_failed':
        return `${prefix} File Processing Failed - ${data.fileName || 'Unknown File'}`;
      case 'system_alert':
        return `${prefix} System Alert - ${data.level || 'Warning'}`;
      default:
        return `${prefix} ${subject}`;
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Valid email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = EmailNotificationProvider;
