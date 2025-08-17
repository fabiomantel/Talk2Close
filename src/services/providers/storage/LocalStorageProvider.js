/**
 * Local Storage Provider
 * Implements IStorageProvider interface for local file system storage
 */

const IStorageProvider = require('../../interfaces/IStorageProvider');
const fs = require('fs-extra');
const path = require('path');

class LocalStorageProvider extends IStorageProvider {
  constructor() {
    super();
    this.connected = false;
    this.basePath = null;
  }

  /**
   * Get provider type identifier
   * @returns {string} - Provider type
   */
  getType() {
    return 'local';
  }

  /**
   * Establish connection to local storage
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Connection success status
   */
  async connect(config) {
    try {
      console.log(`🔗 Connecting to local storage: ${config.path}`);

      // Validate path exists and is accessible
      if (!await fs.pathExists(config.path)) {
        throw new Error(`Local path does not exist: ${config.path}`);
      }

      // Check if path is a directory
      const stats = await fs.stat(config.path);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${config.path}`);
      }

      // Check read permissions
      try {
        await fs.access(config.path, fs.constants.R_OK);
      } catch (error) {
        throw new Error(`No read permission for path: ${config.path}`);
      }

      this.basePath = config.path;
      this.connected = true;

      console.log(`✅ Connected to local storage: ${config.path}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to connect to local storage: ${error.message}`);
      this.connected = false;
      return false;
    }
  }

  /**
   * List files in specified path
   * @param {string} relativePath - Relative path from base directory
   * @returns {Promise<Array>} - Array of file objects with metadata
   */
  async listFiles(relativePath = '') {
    try {
      if (!this.connected) {
        throw new Error('Not connected to local storage');
      }

      const fullPath = path.join(this.basePath, relativePath);
      
      // Ensure path exists
      if (!await fs.pathExists(fullPath)) {
        throw new Error(`Path does not exist: ${fullPath}`);
      }

      const items = await fs.readdir(fullPath, { withFileTypes: true });
      const files = [];

      for (const item of items) {
        if (item.isFile()) {
          const filePath = path.join(fullPath, item.name);
          const stats = await fs.stat(filePath);
          
          files.push({
            name: item.name,
            path: path.join(relativePath, item.name),
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime,
            isDirectory: false
          });
        } else if (item.isDirectory()) {
          // Recursively list files in subdirectories
          const subFiles = await this.listFiles(path.join(relativePath, item.name));
          files.push(...subFiles);
        }
      }

      console.log(`📁 Listed ${files.length} files in ${relativePath || 'root'}`);
      return files;

    } catch (error) {
      console.error(`❌ Failed to list files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download file from local storage (copy to destination)
   * @param {string} remotePath - Remote file path (relative to base)
   * @param {string} localPath - Local destination path
   * @returns {Promise<Object>} - Download result with metadata
   */
  async downloadFile(remotePath, localPath) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to local storage');
      }

      const sourcePath = path.join(this.basePath, remotePath);
      
      // Check if source file exists
      if (!await fs.pathExists(sourcePath)) {
        throw new Error(`Source file does not exist: ${sourcePath}`);
      }

      // Ensure destination directory exists
      const destDir = path.dirname(localPath);
      await fs.ensureDir(destDir);

      // Copy file
      await fs.copy(sourcePath, localPath);
      
      // Get file stats
      const stats = await fs.stat(localPath);

      console.log(`📥 Downloaded file: ${remotePath} -> ${localPath} (${stats.size} bytes)`);

      return {
        success: true,
        sourcePath,
        destinationPath: localPath,
        size: stats.size,
        downloadedAt: new Date()
      };

    } catch (error) {
      console.error(`❌ Failed to download file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate provider-specific configuration
   * @param {Object} config - Configuration to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateConfig(config) {
    const errors = [];

    if (!config.path) {
      errors.push('Local storage path is required');
    } else {
      try {
        // Check if path exists
        if (!await fs.pathExists(config.path)) {
          errors.push(`Local path does not exist: ${config.path}`);
        } else {
          // Check if it's a directory
          const stats = await fs.stat(config.path);
          if (!stats.isDirectory()) {
            errors.push(`Path is not a directory: ${config.path}`);
          } else {
            // Check read permissions
            try {
              await fs.access(config.path, fs.constants.R_OK);
            } catch (error) {
              errors.push(`No read permission for path: ${config.path}`);
            }
          }
        }
      } catch (error) {
        errors.push(`Error validating path: ${error.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Test connection to local storage
   * @param {Object} config - Configuration to test
   * @returns {Promise<Object>} - Test result
   */
  async testConnection(config) {
    try {
      console.log(`🧪 Testing local storage connection: ${config.path}`);

      const validation = await this.validateConfig(config);
      if (!validation.valid) {
        return {
          success: false,
          error: `Configuration validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Try to connect
      const connected = await this.connect(config);
      if (!connected) {
        return {
          success: false,
          error: 'Failed to connect to local storage'
        };
      }

      // Try to list files (test read access)
      try {
        const files = await this.listFiles('');
        return {
          success: true,
          message: `Successfully connected to local storage. Found ${files.length} files.`,
          details: {
            path: config.path,
            fileCount: files.length
          }
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to list files: ${error.message}`
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
   * Get storage information
   * @returns {Promise<Object>} - Storage information
   */
  async getStorageInfo() {
    try {
      if (!this.connected || !this.basePath) {
        throw new Error('Not connected to local storage');
      }

      const stats = await fs.stat(this.basePath);
      const files = await this.listFiles('');

      return {
        type: 'local',
        path: this.basePath,
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        lastModified: stats.mtime,
        permissions: {
          readable: true,
          writable: await this.checkWritePermission()
        }
      };

    } catch (error) {
      console.error(`❌ Failed to get storage info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check write permission
   * @returns {Promise<boolean>} - True if writable
   */
  async checkWritePermission() {
    try {
      await fs.access(this.basePath, fs.constants.W_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Disconnect from local storage
   */
  disconnect() {
    this.connected = false;
    this.basePath = null;
    console.log('🔌 Disconnected from local storage');
  }
}

module.exports = LocalStorageProvider;
