/**
 * AWS S3 Storage Provider
 * Implements IStorageProvider interface for AWS S3 storage
 */

const IStorageProvider = require('../../interfaces/IStorageProvider');
const AWS = require('aws-sdk');

class S3StorageProvider extends IStorageProvider {
  constructor() {
    super();
    this.s3 = null;
    this.config = null;
  }

  /**
   * Connect to AWS S3
   * @param {Object} config - S3 configuration
   * @param {string} config.bucket - S3 bucket name
   * @param {string} config.region - AWS region
   * @param {Object} config.credentials - AWS credentials
   * @param {string} config.credentials.accessKeyId - AWS access key ID
   * @param {string} config.credentials.secretAccessKey - AWS secret access key
   * @param {string} config.prefix - Optional path prefix
   */
  async connect(config) {
    try {
      this.config = config;
      
      // Configure AWS SDK
      AWS.config.update({
        region: config.region,
        accessKeyId: config.credentials.accessKeyId,
        secretAccessKey: config.credentials.secretAccessKey
      });

      this.s3 = new AWS.S3();
      
      // Test connection by listing objects
      await this.s3.listObjectsV2({
        Bucket: config.bucket,
        MaxKeys: 1
      }).promise();

      console.log(`✅ Connected to S3 bucket: ${config.bucket}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to S3:', error.message);
      throw new Error(`S3 connection failed: ${error.message}`);
    }
  }

  /**
   * List files in S3 bucket/path
   * @param {string} path - Path within bucket (optional)
   * @returns {Promise<Array>} - Array of file objects
   */
  async listFiles(path = '') {
    try {
      if (!this.s3) {
        throw new Error('S3 not connected. Call connect() first.');
      }

      const prefix = path ? `${this.config.prefix || ''}${path}/` : (this.config.prefix || '');
      
      const params = {
        Bucket: this.config.bucket,
        Prefix: prefix,
        Delimiter: '/'
      };

      const result = await this.s3.listObjectsV2(params).promise();
      
      const files = result.Contents || [];
      const directories = result.CommonPrefixes || [];

      return {
        files: files.map(file => ({
          name: file.Key.replace(prefix, ''),
          path: file.Key,
          size: file.Size,
          lastModified: file.LastModified,
          etag: file.ETag
        })),
        directories: directories.map(dir => ({
          name: dir.Prefix.replace(prefix, '').replace(/\/$/, ''),
          path: dir.Prefix
        }))
      };
    } catch (error) {
      console.error('❌ Failed to list S3 files:', error.message);
      throw new Error(`S3 list files failed: ${error.message}`);
    }
  }

  /**
   * Download file from S3 to local path
   * @param {string} remotePath - S3 object key
   * @param {string} localPath - Local file path
   * @returns {Promise<boolean>} - Success status
   */
  async downloadFile(remotePath, localPath) {
    try {
      if (!this.s3) {
        throw new Error('S3 not connected. Call connect() first.');
      }

      const fs = require('fs-extra');
      const path = require('path');

      // Ensure local directory exists
      await fs.ensureDir(path.dirname(localPath));

      const params = {
        Bucket: this.config.bucket,
        Key: remotePath
      };

      const fileStream = this.s3.getObject(params).createReadStream();
      const writeStream = fs.createWriteStream(localPath);

      return new Promise((resolve, reject) => {
        fileStream.pipe(writeStream);
        
        writeStream.on('finish', () => {
          console.log(`✅ Downloaded: ${remotePath} -> ${localPath}`);
          resolve(true);
        });
        
        writeStream.on('error', (error) => {
          console.error('❌ Download write error:', error.message);
          reject(new Error(`Download failed: ${error.message}`));
        });
        
        fileStream.on('error', (error) => {
          console.error('❌ Download read error:', error.message);
          reject(new Error(`Download failed: ${error.message}`));
        });
      });
    } catch (error) {
      console.error('❌ Failed to download S3 file:', error.message);
      throw new Error(`S3 download failed: ${error.message}`);
    }
  }

  /**
   * Validate S3 configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validation result
   */
  validateConfig(config) {
    const errors = [];

    if (!config.bucket) {
      errors.push('S3 bucket name is required');
    }

    if (!config.region) {
      errors.push('AWS region is required');
    }

    if (!config.credentials) {
      errors.push('AWS credentials are required');
    } else {
      if (!config.credentials.accessKeyId) {
        errors.push('AWS access key ID is required');
      }
      if (!config.credentials.secretAccessKey) {
        errors.push('AWS secret access key is required');
      }
    }

    // Validate region format
    if (config.region && !/^[a-z0-9-]+$/.test(config.region)) {
      errors.push('Invalid AWS region format');
    }

    // Validate bucket name format
    if (config.bucket && !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(config.bucket)) {
      errors.push('Invalid S3 bucket name format');
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
    return 's3';
  }

  /**
   * Test S3 connection
   * @param {Object} config - S3 configuration
   * @returns {Promise<Object>} - Test result
   */
  async testConnection(config) {
    try {
      const tempS3 = new AWS.S3({
        region: config.region,
        accessKeyId: config.credentials.accessKeyId,
        secretAccessKey: config.credentials.secretAccessKey
      });

      // Test bucket access
      await tempS3.headBucket({ Bucket: config.bucket }).promise();

      // Test listing objects
      const listResult = await tempS3.listObjectsV2({
        Bucket: config.bucket,
        MaxKeys: 1
      }).promise();

      return {
        success: true,
        message: 'S3 connection test successful',
        details: {
          bucket: config.bucket,
          region: config.region,
          objectCount: listResult.KeyCount || 0,
          prefix: config.prefix || 'none'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `S3 connection test failed: ${error.message}`,
        error: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Get storage information
   * @returns {Promise<Object>} - Storage info
   */
  async getStorageInfo() {
    try {
      if (!this.s3) {
        throw new Error('S3 not connected');
      }

      const result = await this.s3.listObjectsV2({
        Bucket: this.config.bucket,
        Prefix: this.config.prefix || ''
      }).promise();

      const totalSize = result.Contents?.reduce((sum, obj) => sum + obj.Size, 0) || 0;
      const objectCount = result.Contents?.length || 0;

      return {
        type: 's3',
        bucket: this.config.bucket,
        region: this.config.region,
        prefix: this.config.prefix || 'none',
        totalObjects: objectCount,
        totalSize: totalSize,
        lastModified: result.Contents?.[0]?.LastModified || null
      };
    } catch (error) {
      console.error('❌ Failed to get S3 storage info:', error.message);
      throw new Error(`Failed to get storage info: ${error.message}`);
    }
  }

  /**
   * Check write permissions
   * @returns {Promise<boolean>} - Write permission status
   */
  async checkWritePermission() {
    try {
      if (!this.s3) {
        throw new Error('S3 not connected');
      }

      const testKey = `${this.config.prefix || ''}test-write-permission-${Date.now()}.txt`;
      
      await this.s3.putObject({
        Bucket: this.config.bucket,
        Key: testKey,
        Body: 'test'
      }).promise();

      // Clean up test file
      await this.s3.deleteObject({
        Bucket: this.config.bucket,
        Key: testKey
      }).promise();

      return true;
    } catch (error) {
      console.error('❌ S3 write permission check failed:', error.message);
      return false;
    }
  }
}

module.exports = S3StorageProvider;
