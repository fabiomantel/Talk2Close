/**
 * Storage Provider Interface
 * Abstract storage operations for different cloud and local storage systems
 */

class IStorageProvider {
  /**
   * Establish connection to storage system
   * @param {Object} config - Provider-specific configuration
   * @returns {Promise<boolean>} - Connection success status
   */
  async connect(config) {
    throw new Error('connect method must be implemented');
  }

  /**
   * List files in specified path
   * @param {string} path - Path to list files from
   * @returns {Promise<Array>} - Array of file objects with metadata
   */
  async listFiles(path) {
    throw new Error('listFiles method must be implemented');
  }

  /**
   * Download file from storage
   * @param {string} remotePath - Remote file path
   * @param {string} localPath - Local destination path
   * @returns {Promise<Object>} - Download result with metadata
   */
  async downloadFile(remotePath, localPath) {
    throw new Error('downloadFile method must be implemented');
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
   * @returns {string} - Provider type (e.g., 's3', 'azure', 'local')
   */
  getType() {
    throw new Error('getType method must be implemented');
  }

  /**
   * Test connection to storage system
   * @param {Object} config - Provider-specific configuration
   * @returns {Promise<Object>} - Test result with success status and details
   */
  async testConnection(config) {
    throw new Error('testConnection method must be implemented');
  }
}

module.exports = IStorageProvider;
