/**
 * Notification Provider Interface
 * Abstract notification delivery across different communication channels
 */

class INotificationProvider {
  /**
   * Configure notification provider
   * @param {Object} config - Provider-specific configuration
   * @returns {Promise<boolean>} - Configuration success status
   */
  async configure(config) {
    throw new Error('configure method must be implemented');
  }

  /**
   * Send notification through provider
   * @param {Object} notification - Notification object with content and metadata
   * @returns {Promise<Object>} - Send result with delivery status
   */
  async sendNotification(notification) {
    throw new Error('sendNotification method must be implemented');
  }

  /**
   * Validate provider-specific configuration
   * @param {Object} config - Configuration to validate
   * @returns {Promise<Object>} - Validation result with errors if any
   */
  async validateConfig(config) {
    throw new Error('validateConfig method must be implemented');
  }

  /**
   * Get provider type identifier
   * @returns {string} - Provider type (e.g., 'email', 'slack', 'webhook')
   */
  getType() {
    throw new Error('getType method must be implemented');
  }

  /**
   * Test notification delivery
   * @param {Object} config - Provider-specific configuration
   * @returns {Promise<Object>} - Test result with success status and details
   */
  async testNotification(config) {
    throw new Error('testNotification method must be implemented');
  }

  /**
   * Check if provider is enabled
   * @returns {boolean} - Provider enabled status
   */
  isEnabled() {
    throw new Error('isEnabled method must be implemented');
  }
}

module.exports = INotificationProvider;
