/**
 * File Monitor Interface
 * Abstract file system monitoring across different platforms and methods
 */

class IFileMonitor {
  /**
   * Begin monitoring specified path
   * @param {Object} config - Monitor-specific configuration
   * @returns {Promise<string>} - Monitoring handle/identifier
   */
  async startMonitoring(config) {
    throw new Error('startMonitoring method must be implemented');
  }

  /**
   * Stop monitoring
   * @param {string} handle - Monitoring handle/identifier
   * @returns {Promise<boolean>} - Stop success status
   */
  async stopMonitoring(handle) {
    throw new Error('stopMonitoring method must be implemented');
  }

  /**
   * Validate monitor-specific configuration
   * @param {Object} config - Configuration to validate
   * @returns {Promise<Object>} - Validation result with errors if any
   */
  async validateConfig(config) {
    throw new Error('validateConfig method must be implemented');
  }

  /**
   * Get monitor type identifier
   * @returns {string} - Monitor type (e.g., 'polling', 'events', 'cloud')
   */
  getType() {
    throw new Error('getType method must be implemented');
  }

  /**
   * Test monitor configuration
   * @param {Object} config - Monitor-specific configuration
   * @returns {Promise<Object>} - Test result with success status and details
   */
  async testMonitoring(config) {
    throw new Error('testMonitoring method must be implemented');
  }

  /**
   * Get current monitoring status
   * @param {string} handle - Monitoring handle/identifier
   * @returns {Promise<Object>} - Current status information
   */
  async getStatus(handle) {
    throw new Error('getStatus method must be implemented');
  }

  /**
   * Scan for files immediately (manual trigger)
   * @param {Object} config - Monitor-specific configuration
   * @returns {Promise<Array>} - Array of discovered files
   */
  async scanForFiles(config) {
    throw new Error('scanForFiles method must be implemented');
  }
}

module.exports = IFileMonitor;
