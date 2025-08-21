/**
 * Polling Monitor Provider
 * Implements IFileMonitor interface for regular folder scanning
 */

const IFileMonitor = require('../../interfaces/IFileMonitor');
const fs = require('fs-extra');
const path = require('path');

class PollingMonitor extends IFileMonitor {
  constructor() {
    super();
    this.monitoringHandles = new Map();
    this.lastScanResults = new Map();
  }

  /**
   * Get monitor type identifier
   * @returns {string} - Monitor type
   */
  getType() {
    return 'polling';
  }

  /**
   * Begin monitoring specified path
   * @param {Object} config - Monitor configuration
   * @returns {Promise<string>} - Monitoring handle/identifier
   */
  async startMonitoring(config) {
    try {
      console.log(`👀 Starting polling monitor for path: ${config.path}`);

      // Validate configuration
      const validation = await this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid polling monitor configuration: ${validation.errors.join(', ')}`);
      }

      // Generate unique handle
      const handle = `polling_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store monitoring configuration
      this.monitoringHandles.set(handle, {
        config,
        isActive: true,
        lastScan: null,
        intervalId: null,
        scanCount: 0
      });

      // Start polling interval
      const scanInterval = config.scanInterval || 300; // Default 5 minutes
      const intervalId = setInterval(async () => {
        await this.performScan(handle);
      }, scanInterval * 1000);

      // Store interval ID
      this.monitoringHandles.get(handle).intervalId = intervalId;

      // Perform initial scan
      await this.performScan(handle);

      console.log(`✅ Started polling monitor with handle: ${handle}`);
      return handle;

    } catch (error) {
      console.error(`❌ Failed to start polling monitor: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop monitoring
   * @param {string} handle - Monitoring handle/identifier
   * @returns {Promise<boolean>} - Stop success status
   */
  async stopMonitoring(handle) {
    try {
      console.log(`⏹️ Stopping polling monitor: ${handle}`);

      const monitorInfo = this.monitoringHandles.get(handle);
      if (!monitorInfo) {
        throw new Error(`Monitoring handle not found: ${handle}`);
      }

      // Clear interval
      if (monitorInfo.intervalId) {
        clearInterval(monitorInfo.intervalId);
      }

      // Mark as inactive
      monitorInfo.isActive = false;

      // Remove from handles
      this.monitoringHandles.delete(handle);

      console.log(`✅ Stopped polling monitor: ${handle}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to stop polling monitor: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate monitor-specific configuration
   * @param {Object} config - Configuration to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateConfig(config) {
    const errors = [];

    if (!config.path) {
      errors.push('Monitor path is required');
    } else {
      try {
        // Check if path exists
        if (!await fs.pathExists(config.path)) {
          errors.push(`Monitor path does not exist: ${config.path}`);
        } else {
          // Check if it's a directory
          const stats = await fs.stat(config.path);
          if (!stats.isDirectory()) {
            errors.push(`Monitor path is not a directory: ${config.path}`);
          } else {
            // Check read permissions
            try {
              await fs.access(config.path, fs.constants.R_OK);
            } catch (error) {
              errors.push(`No read permission for monitor path: ${config.path}`);
            }
          }
        }
      } catch (error) {
        errors.push(`Error validating monitor path: ${error.message}`);
      }
    }

    // Validate scan interval
    if (config.scanInterval) {
      const interval = parseInt(config.scanInterval);
      if (isNaN(interval) || interval < 30 || interval > 3600) {
        errors.push('Scan interval must be between 30 and 3600 seconds');
      }
    }

    // Validate file patterns if specified
    if (config.filePatterns) {
      if (!Array.isArray(config.filePatterns)) {
        errors.push('File patterns must be an array');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Test monitor configuration
   * @param {Object} config - Monitor configuration
   * @returns {Promise<Object>} - Test result
   */
  async testMonitoring(config) {
    try {
      console.log(`🧪 Testing polling monitor configuration: ${config.path}`);

      const validation = await this.validateConfig(config);
      if (!validation.valid) {
        return {
          success: false,
          error: `Configuration validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Try to scan for files
      try {
        const files = await this.scanForFiles(config);
        return {
          success: true,
          message: `Successfully tested polling monitor. Found ${files.length} files.`,
          details: {
            path: config.path,
            fileCount: files.length,
            scanInterval: config.scanInterval || 300
          }
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to scan for files: ${error.message}`
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
   * Get current monitoring status
   * @param {string} handle - Monitoring handle/identifier
   * @returns {Promise<Object>} - Current status information
   */
  async getStatus(handle) {
    try {
      const monitorInfo = this.monitoringHandles.get(handle);
      if (!monitorInfo) {
        throw new Error(`Monitoring handle not found: ${handle}`);
      }

      return {
        handle,
        isActive: monitorInfo.isActive,
        config: monitorInfo.config,
        lastScan: monitorInfo.lastScan,
        scanCount: monitorInfo.scanCount,
        uptime: monitorInfo.lastScan ? Date.now() - monitorInfo.lastScan.getTime() : null
      };

    } catch (error) {
      console.error(`❌ Failed to get monitor status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scan for files immediately (manual trigger)
   * @param {Object} config - Monitor configuration
   * @returns {Promise<Array>} - Array of discovered files
   */
  async scanForFiles(config) {
    try {
      console.log(`🔍 Scanning for files in: ${config.path}`);

      if (!await fs.pathExists(config.path)) {
        throw new Error(`Monitor path does not exist: ${config.path}`);
      }

      const items = await fs.readdir(config.path, { withFileTypes: true });
      const files = [];

      for (const item of items) {
        if (item.isFile()) {
          const filePath = path.join(config.path, item.name);
          const stats = await fs.stat(filePath);
          
          // Apply file pattern filters if specified
          if (config.filePatterns && config.filePatterns.length > 0) {
            const matchesPattern = config.filePatterns.some(pattern => {
              if (typeof pattern === 'string') {
                return item.name.includes(pattern);
              } else if (pattern instanceof RegExp) {
                return pattern.test(item.name);
              }
              return false;
            });

            if (!matchesPattern) {
              continue;
            }
          }

          files.push({
            name: item.name,
            path: item.name, // Relative path for storage provider
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime,
            isDirectory: false
          });
        }
      }

      console.log(`📁 Found ${files.length} files in scan`);
      return files;

    } catch (error) {
      console.error(`❌ Failed to scan for files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Perform a scan for a specific monitor handle
   * @param {string} handle - Monitoring handle
   */
  async performScan(handle) {
    try {
      const monitorInfo = this.monitoringHandles.get(handle);
      if (!monitorInfo || !monitorInfo.isActive) {
        return;
      }

      console.log(`🔍 Performing scan for monitor: ${handle}`);

      const files = await this.scanForFiles(monitorInfo.config);
      
      // Update monitor info
      monitorInfo.lastScan = new Date();
      monitorInfo.scanCount++;

      // Store scan results
      this.lastScanResults.set(handle, {
        timestamp: monitorInfo.lastScan,
        fileCount: files.length,
        files: files
      });

      // Emit scan event if callback is provided
      if (monitorInfo.config.onScan) {
        try {
          await monitorInfo.config.onScan(files, handle);
        } catch (error) {
          console.error(`❌ Error in scan callback: ${error.message}`);
        }
      }

      console.log(`✅ Scan completed for monitor ${handle}: ${files.length} files found`);

    } catch (error) {
      console.error(`❌ Scan failed for monitor ${handle}: ${error.message}`);
    }
  }

  /**
   * Get all active monitoring handles
   * @returns {Array<string>} - Array of active handles
   */
  getActiveHandles() {
    return Array.from(this.monitoringHandles.keys()).filter(handle => {
      const info = this.monitoringHandles.get(handle);
      return info && info.isActive;
    });
  }

  /**
   * Get scan results for a handle
   * @param {string} handle - Monitoring handle
   * @returns {Object|null} - Last scan results
   */
  getLastScanResults(handle) {
    return this.lastScanResults.get(handle) || null;
  }

  /**
   * Get monitoring statistics
   * @returns {Object} - Monitoring statistics
   */
  getMonitoringStats() {
    const activeHandles = this.getActiveHandles();
    const totalScans = Array.from(this.monitoringHandles.values())
      .reduce((sum, info) => sum + info.scanCount, 0);

    return {
      activeMonitors: activeHandles.length,
      totalScans,
      lastScanResults: this.lastScanResults.size
    };
  }

  /**
   * Clean up all monitoring
   */
  cleanup() {
    console.log('🧹 Cleaning up polling monitors');

    for (const [handle, info] of this.monitoringHandles.entries()) {
      if (info.intervalId) {
        clearInterval(info.intervalId);
      }
    }

    this.monitoringHandles.clear();
    this.lastScanResults.clear();

    console.log('✅ Polling monitors cleaned up');
  }
}

module.exports = PollingMonitor;
