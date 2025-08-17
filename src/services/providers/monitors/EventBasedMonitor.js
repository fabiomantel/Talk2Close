/**
 * Event-Based File Monitor
 * Implements IFileMonitor interface for file system events
 */

const IFileMonitor = require('../../interfaces/IFileMonitor');
const fs = require('fs-extra');
const path = require('path');

class EventBasedMonitor extends IFileMonitor {
  constructor() {
    super();
    this.watchers = new Map();
    this.activeHandles = new Map();
    this.lastScanResults = new Map();
    this.monitoringStats = {
      totalEvents: 0,
      fileEvents: 0,
      directoryEvents: 0,
      errorEvents: 0,
      startTime: null
    };
  }

  /**
   * Start monitoring directory for file system events
   * @param {Object} config - Monitor configuration
   * @param {string} config.path - Directory path to monitor
   * @param {Array} config.fileExtensions - File extensions to watch
   * @param {number} config.debounceMs - Debounce time in milliseconds
   * @param {Function} config.onFileDetected - Callback when file is detected
   * @returns {Promise<string>} - Monitor handle
   */
  async startMonitoring(config) {
    try {
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      const monitorPath = path.resolve(config.path);
      
      // Check if directory exists and is accessible
      if (!await fs.pathExists(monitorPath)) {
        throw new Error(`Directory does not exist: ${monitorPath}`);
      }

      const stats = await fs.stat(monitorPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${monitorPath}`);
      }

      // Generate unique handle
      const handle = `event-monitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Initialize monitoring stats
      this.monitoringStats.startTime = new Date();
      
      // Set up file system watcher
      const watcher = fs.watch(monitorPath, { 
        recursive: true,
        persistent: true 
      }, (eventType, filename) => {
        this.handleFileSystemEvent(handle, eventType, filename, config);
      });

      // Store watcher and config
      this.watchers.set(handle, watcher);
      this.activeHandles.set(handle, {
        path: monitorPath,
        config: config,
        startTime: new Date(),
        events: [],
        status: 'active'
      });

      console.log(`✅ Event-based monitoring started: ${monitorPath} (handle: ${handle})`);
      return handle;
    } catch (error) {
      console.error('❌ Failed to start event-based monitoring:', error.message);
      throw new Error(`Event monitoring start failed: ${error.message}`);
    }
  }

  /**
   * Stop monitoring
   * @param {string} handle - Monitor handle
   * @returns {Promise<boolean>} - Success status
   */
  async stopMonitoring(handle) {
    try {
      if (!this.activeHandles.has(handle)) {
        throw new Error(`Monitor handle not found: ${handle}`);
      }

      const watcher = this.watchers.get(handle);
      if (watcher) {
        watcher.close();
        this.watchers.delete(handle);
      }

      const monitorInfo = this.activeHandles.get(handle);
      monitorInfo.status = 'stopped';
      monitorInfo.stopTime = new Date();

      console.log(`✅ Event-based monitoring stopped: ${handle}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to stop event-based monitoring:', error.message);
      throw new Error(`Event monitoring stop failed: ${error.message}`);
    }
  }

  /**
   * Validate monitor configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validation result
   */
  validateConfig(config) {
    const errors = [];

    if (!config.path) {
      errors.push('Monitor path is required');
    }

    if (config.debounceMs && (isNaN(config.debounceMs) || config.debounceMs < 0)) {
      errors.push('Debounce time must be a positive number');
    }

    if (config.fileExtensions && !Array.isArray(config.fileExtensions)) {
      errors.push('File extensions must be an array');
    }

    if (config.onFileDetected && typeof config.onFileDetected !== 'function') {
      errors.push('onFileDetected must be a function');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get provider type
   * @returns {string} - Provider type
   */
  getType() {
    return 'events';
  }

  /**
   * Test event-based monitoring
   * @param {Object} config - Monitor configuration
   * @returns {Promise<Object>} - Test result
   */
  async testMonitoring(config) {
    try {
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        return {
          success: false,
          message: `Configuration validation failed: ${validation.errors.join(', ')}`
        };
      }

      const monitorPath = path.resolve(config.path);
      
      // Check directory accessibility
      if (!await fs.pathExists(monitorPath)) {
        return {
          success: false,
          message: `Directory does not exist: ${monitorPath}`
        };
      }

      const stats = await fs.stat(monitorPath);
      if (!stats.isDirectory()) {
        return {
          success: false,
          message: `Path is not a directory: ${monitorPath}`
        };
      }

      // Test file system permissions
      try {
        await fs.access(monitorPath, fs.constants.R_OK);
      } catch (error) {
        return {
          success: false,
          message: `No read permission for directory: ${monitorPath}`
        };
      }

      // Test creating a temporary watcher
      const testWatcher = fs.watch(monitorPath, { recursive: false }, () => {});
      testWatcher.close();

      return {
        success: true,
        message: 'Event-based monitoring test successful',
        details: {
          path: monitorPath,
          accessible: true,
          isDirectory: true,
          permissions: 'readable',
          fileExtensions: config.fileExtensions || 'all',
          debounceMs: config.debounceMs || 'none'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Event-based monitoring test failed: ${error.message}`,
        error: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Get monitoring status
   * @param {string} handle - Monitor handle
   * @returns {Promise<Object>} - Status information
   */
  async getStatus(handle) {
    try {
      if (!this.activeHandles.has(handle)) {
        throw new Error(`Monitor handle not found: ${handle}`);
      }

      const monitorInfo = this.activeHandles.get(handle);
      const watcher = this.watchers.get(handle);

      return {
        handle: handle,
        status: monitorInfo.status,
        path: monitorInfo.path,
        startTime: monitorInfo.startTime,
        stopTime: monitorInfo.stopTime,
        events: monitorInfo.events.length,
        isActive: !!watcher,
        uptime: monitorInfo.stopTime 
          ? monitorInfo.stopTime - monitorInfo.startTime 
          : Date.now() - monitorInfo.startTime.getTime()
      };
    } catch (error) {
      console.error('❌ Failed to get monitoring status:', error.message);
      throw new Error(`Status retrieval failed: ${error.message}`);
    }
  }

  /**
   * Scan for files in monitored directory
   * @param {Object} config - Monitor configuration
   * @returns {Promise<Array>} - Array of discovered files
   */
  async scanForFiles(config) {
    try {
      const monitorPath = path.resolve(config.path);
      
      if (!await fs.pathExists(monitorPath)) {
        throw new Error(`Directory does not exist: ${monitorPath}`);
      }

      const files = [];
      const scanOptions = {
        fileExtensions: config.fileExtensions || [],
        recursive: true,
        maxDepth: config.maxDepth || 10
      };

      await this.scanDirectory(monitorPath, files, scanOptions, 0);
      
      console.log(`✅ Event-based scan completed: ${files.length} files found in ${monitorPath}`);
      return files;
    } catch (error) {
      console.error('❌ Failed to scan for files:', error.message);
      throw new Error(`File scan failed: ${error.message}`);
    }
  }

  /**
   * Handle file system events
   * @param {string} handle - Monitor handle
   * @param {string} eventType - Event type (rename, change)
   * @param {string} filename - Affected filename
   * @param {Object} config - Monitor configuration
   */
  handleFileSystemEvent(handle, eventType, filename, config) {
    try {
      if (!this.activeHandles.has(handle)) {
        return;
      }

      const monitorInfo = this.activeHandles.get(handle);
      const fullPath = path.join(monitorInfo.path, filename);

      // Update monitoring stats
      this.monitoringStats.totalEvents++;
      
      // Check if file matches our criteria
      if (this.shouldProcessFile(filename, config)) {
        this.monitoringStats.fileEvents++;
        
        const event = {
          type: eventType,
          filename: filename,
          fullPath: fullPath,
          timestamp: new Date(),
          handle: handle
        };

        monitorInfo.events.push(event);

        // Debounce processing
        if (config.debounceMs) {
          this.debounceFileProcessing(handle, event, config);
        } else {
          this.processFileEvent(handle, event, config);
        }

        console.log(`📁 File event detected: ${eventType} - ${filename}`);
      } else {
        this.monitoringStats.directoryEvents++;
      }
    } catch (error) {
      this.monitoringStats.errorEvents++;
      console.error('❌ Error handling file system event:', error.message);
    }
  }

  /**
   * Check if file should be processed
   * @param {string} filename - Filename to check
   * @param {Object} config - Monitor configuration
   * @returns {boolean} - Should process file
   */
  shouldProcessFile(filename, config) {
    if (!filename) return false;

    // Check file extensions
    if (config.fileExtensions && config.fileExtensions.length > 0) {
      const ext = path.extname(filename).toLowerCase();
      if (!config.fileExtensions.includes(ext)) {
        return false;
      }
    }

    // Check UUID pattern if required
    if (config.requireUUID) {
      const nameWithoutExt = path.basename(filename, path.extname(filename));
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(nameWithoutExt)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Debounce file processing
   * @param {string} handle - Monitor handle
   * @param {Object} event - File event
   * @param {Object} config - Monitor configuration
   */
  debounceFileProcessing(handle, event, config) {
    const key = `${handle}-${event.filename}`;
    
    if (this.debounceTimers) {
      clearTimeout(this.debounceTimers.get(key));
    } else {
      this.debounceTimers = new Map();
    }

    this.debounceTimers.set(key, setTimeout(() => {
      this.processFileEvent(handle, event, config);
      this.debounceTimers.delete(key);
    }, config.debounceMs));
  }

  /**
   * Process file event
   * @param {string} handle - Monitor handle
   * @param {Object} event - File event
   * @param {Object} config - Monitor configuration
   */
  processFileEvent(handle, event, config) {
    try {
      if (config.onFileDetected && typeof config.onFileDetected === 'function') {
        config.onFileDetected({
          handle: handle,
          event: event,
          config: config
        });
      }
    } catch (error) {
      console.error('❌ Error in file event processing:', error.message);
    }
  }

  /**
   * Recursively scan directory for files
   * @param {string} dirPath - Directory path
   * @param {Array} files - Array to store found files
   * @param {Object} options - Scan options
   * @param {number} depth - Current depth
   */
  async scanDirectory(dirPath, files, options, depth) {
    try {
      if (depth > options.maxDepth) return;

      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
          await this.scanDirectory(fullPath, files, options, depth + 1);
        } else if (stats.isFile()) {
          if (this.shouldProcessFile(item, options)) {
            files.push({
              name: item,
              path: fullPath,
              size: stats.size,
              modified: stats.mtime,
              created: stats.birthtime
            });
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning directory ${dirPath}:`, error.message);
    }
  }

  /**
   * Get active monitor handles
   * @returns {Array} - Array of active handles
   */
  getActiveHandles() {
    return Array.from(this.activeHandles.keys());
  }

  /**
   * Get last scan results
   * @returns {Object} - Last scan results by handle
   */
  getLastScanResults() {
    return Object.fromEntries(this.lastScanResults);
  }

  /**
   * Get monitoring statistics
   * @returns {Object} - Monitoring statistics
   */
  getMonitoringStats() {
    return {
      ...this.monitoringStats,
      activeHandles: this.activeHandles.size,
      totalWatchers: this.watchers.size,
      uptime: this.monitoringStats.startTime 
        ? Date.now() - this.monitoringStats.startTime.getTime()
        : 0
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Stop all active monitors
    for (const handle of this.activeHandles.keys()) {
      this.stopMonitoring(handle).catch(console.error);
    }

    // Clear debounce timers
    if (this.debounceTimers) {
      for (const timer of this.debounceTimers.values()) {
        clearTimeout(timer);
      }
      this.debounceTimers.clear();
    }

    // Clear collections
    this.watchers.clear();
    this.activeHandles.clear();
    this.lastScanResults.clear();

    console.log('✅ Event-based monitor cleanup completed');
  }
}

module.exports = EventBasedMonitor;
