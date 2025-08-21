/**
 * Batch Configuration Routes
 * API endpoints for managing external folders and notification configurations
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const batchConfigurationService = require('../services/BatchConfigurationService');
const providerFactory = require('../services/ProviderFactory');

const router = express.Router();

// ============================================================================
// External Folder Management
// ============================================================================

/**
 * GET /api/batch-config/folders
 * List all external folder configurations
 */
router.get('/folders', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, activeOnly = false } = req.query;

    const result = await batchConfigurationService.listExternalFolders({
      page: parseInt(page),
      limit: parseInt(limit),
      activeOnly: activeOnly === 'true'
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error listing external folders:', error);
    next(error);
  }
});

/**
 * POST /api/batch-config/folders
 * Create new external folder configuration
 */
router.post('/folders', 
  [
    body('name').notEmpty().withMessage('Folder name is required'),
    body('storage').isObject().withMessage('Storage configuration is required'),
    body('monitor').isObject().withMessage('Monitor configuration is required'),
    body('processing').isObject().withMessage('Processing configuration is required')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const folderConfig = req.body;
      const folder = await batchConfigurationService.createExternalFolder(folderConfig);

      res.json({
        success: true,
        data: folder,
        message: 'External folder configuration created successfully'
      });

    } catch (error) {
      console.error('❌ Error creating external folder:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * GET /api/batch-config/folders/:id
 * Get external folder configuration by ID
 */
router.get('/folders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const folder = await batchConfigurationService.getExternalFolder(parseInt(id));

    res.json({
      success: true,
      data: folder
    });

  } catch (error) {
    console.error('❌ Error getting external folder:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/batch-config/folders/:id
 * Update external folder configuration
 */
router.put('/folders/:id', 
  [
    body('name').optional().notEmpty().withMessage('Folder name cannot be empty'),
    body('storage').optional().isObject().withMessage('Storage configuration must be an object'),
    body('monitor').optional().isObject().withMessage('Monitor configuration must be an object'),
    body('processing').optional().isObject().withMessage('Processing configuration must be an object'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const updates = req.body;

      const folder = await batchConfigurationService.updateExternalFolder(parseInt(id), updates);

      res.json({
        success: true,
        data: folder,
        message: 'External folder configuration updated successfully'
      });

    } catch (error) {
      console.error('❌ Error updating external folder:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * DELETE /api/batch-config/folders/:id
 * Delete external folder configuration
 */
router.delete('/folders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await batchConfigurationService.deleteExternalFolder(parseInt(id));

    res.json({
      success: true,
      message: 'External folder configuration deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting external folder:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/batch-config/folders/:id/test
 * Test external folder configuration
 */
router.post('/folders/:id/test', async (req, res, next) => {
  try {
    const { id } = req.params;

    const testResults = await batchConfigurationService.testExternalFolder(parseInt(id));

    res.json({
      success: true,
      data: testResults
    });

  } catch (error) {
    console.error('❌ Error testing external folder:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/batch-config/folders/:id/scan
 * Manually trigger folder scan
 */
router.post('/folders/:id/scan', async (req, res, next) => {
  try {
    const { id } = req.params;

    const folder = await batchConfigurationService.getExternalFolder(parseInt(id));
    
    // Create monitor provider and scan
    const monitorProvider = await providerFactory.createMonitorProvider(
      folder.monitorConfig.type,
      folder.monitorConfig.config
    );

    const files = await monitorProvider.scanForFiles(folder.monitorConfig.config);

    res.json({
      success: true,
      data: {
        folderId: parseInt(id),
        folderName: folder.name,
        filesFound: files.length,
        files: files
      },
      message: `Found ${files.length} files in folder scan`
    });

  } catch (error) {
    console.error('❌ Error scanning external folder:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Notification Configuration Management
// ============================================================================

/**
 * GET /api/batch-config/notifications
 * List all notification configurations
 */
router.get('/notifications', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, activeOnly = false } = req.query;

    const result = await batchConfigurationService.listNotificationConfigs({
      page: parseInt(page),
      limit: parseInt(limit),
      activeOnly: activeOnly === 'true'
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error listing notification configs:', error);
    next(error);
  }
});

/**
 * POST /api/batch-config/notifications
 * Create new notification configuration
 */
router.post('/notifications', 
  [
    body('type').notEmpty().withMessage('Notification type is required'),
    body('name').notEmpty().withMessage('Notification name is required'),
    body('config').isObject().withMessage('Notification configuration is required'),
    body('conditions').optional().isArray().withMessage('Conditions must be an array')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const notificationConfig = req.body;
      const config = await batchConfigurationService.createNotificationConfig(notificationConfig);

      res.json({
        success: true,
        data: config,
        message: 'Notification configuration created successfully'
      });

    } catch (error) {
      console.error('❌ Error creating notification config:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * PUT /api/batch-config/notifications/:id
 * Update notification configuration
 */
router.put('/notifications/:id', 
  [
    body('type').optional().notEmpty().withMessage('Notification type cannot be empty'),
    body('name').optional().notEmpty().withMessage('Notification name cannot be empty'),
    body('config').optional().isObject().withMessage('Configuration must be an object'),
    body('conditions').optional().isArray().withMessage('Conditions must be an array'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const updates = req.body;

      const config = await batchConfigurationService.updateNotificationConfig(parseInt(id), updates);

      res.json({
        success: true,
        data: config,
        message: 'Notification configuration updated successfully'
      });

    } catch (error) {
      console.error('❌ Error updating notification config:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * DELETE /api/batch-config/notifications/:id
 * Delete notification configuration
 */
router.delete('/notifications/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await batchConfigurationService.deleteNotificationConfig(parseInt(id));

    res.json({
      success: true,
      message: 'Notification configuration deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting notification config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/batch-config/notifications/:id/test
 * Test notification configuration
 */
router.post('/notifications/:id/test', async (req, res, next) => {
  try {
    const { id } = req.params;

    const testResult = await batchConfigurationService.testNotificationConfig(parseInt(id));

    res.json({
      success: true,
      data: testResult
    });

  } catch (error) {
    console.error('❌ Error testing notification config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Global Batch Configuration
// ============================================================================

/**
 * GET /api/batch-config
 * Get global batch processing configuration
 */
router.get('/', async (req, res, next) => {
  try {
    const config = await batchConfigurationService.getGlobalConfiguration();

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('❌ Error getting global configuration:', error);
    next(error);
  }
});

/**
 * PUT /api/batch-config
 * Update global batch processing configuration
 */
router.put('/', 
  [
    body('maxConcurrentFiles').optional().isInt({ min: 1, max: 20 }).withMessage('Max concurrent files must be between 1 and 20'),
    body('retryConfig').optional().isObject().withMessage('Retry configuration must be an object'),
    body('autoStart').optional().isBoolean().withMessage('Auto start must be a boolean'),
    body('immediateProcessing').optional().isBoolean().withMessage('Immediate processing must be a boolean'),
    body('backgroundProcessing').optional().isBoolean().withMessage('Background processing must be a boolean')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const config = req.body;
      const updatedConfig = await batchConfigurationService.updateGlobalConfiguration(config);

      res.json({
        success: true,
        data: updatedConfig,
        message: 'Global configuration updated successfully'
      });

    } catch (error) {
      console.error('❌ Error updating global configuration:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================================================
// System Configuration
// ============================================================================
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await batchConfigurationService.getConfigurationSummary();

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('❌ Error getting configuration summary:', error);
    next(error);
  }
});

/**
 * GET /api/batch-config/providers
 * Get available provider types
 */
router.get('/providers', async (req, res, next) => {
  try {
    const providers = providerFactory.getAvailableProviders();

    res.json({
      success: true,
      data: providers
    });

  } catch (error) {
    console.error('❌ Error getting available providers:', error);
    next(error);
  }
});

/**
 * POST /api/batch-config/providers/test
 * Test provider configuration
 */
router.post('/providers/test', 
  [
    body('providerType').isIn(['storage', 'notification', 'monitor']).withMessage('Valid provider type is required'),
    body('type').notEmpty().withMessage('Provider type is required'),
    body('config').isObject().withMessage('Provider configuration is required')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { providerType, type, config } = req.body;

      const testResult = await providerFactory.testProvider(providerType, type, config);

      res.json({
        success: true,
        data: testResult
      });

    } catch (error) {
      console.error('❌ Error testing provider:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

module.exports = router;
