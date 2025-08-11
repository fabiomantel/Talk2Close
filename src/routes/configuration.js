/**
 * Configuration Management Routes
 * Handles dynamic scoring configuration management
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const configurationService = require('../services/configurationService');

const router = express.Router();

/**
 * GET /api/configuration
 * Get the currently active configuration
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await configurationService.getActiveConfiguration();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.configuration,
        isDefault: result.isDefault || false
      });
    } else {
      res.status(400).json({
        error: true,
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error getting active configuration:', error);
    next(error);
  }
});

/**
 * GET /api/configuration/list
 * List all configurations
 */
router.get('/list', async (req, res, next) => {
  try {
    const result = await configurationService.listConfigurations();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.configurations
      });
    } else {
      res.status(400).json({
        error: true,
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error listing configurations:', error);
    next(error);
  }
});

/**
 * POST /api/configuration
 * Create a new configuration
 */
router.post('/', 
  [
    body('name').notEmpty().withMessage('Configuration name is required'),
    body('weights').isObject().withMessage('Weights must be an object'),
    body('weights.urgency').isFloat({ min: 0, max: 1 }).withMessage('Urgency weight must be between 0 and 1'),
    body('weights.budget').isFloat({ min: 0, max: 1 }).withMessage('Budget weight must be between 0 and 1'),
    body('weights.interest').isFloat({ min: 0, max: 1 }).withMessage('Interest weight must be between 0 and 1'),
    body('weights.engagement').isFloat({ min: 0, max: 1 }).withMessage('Engagement weight must be between 0 and 1'),
    body('phrases').isObject().withMessage('Phrases must be an object'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: true,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, weights, phrases, isActive } = req.body;

      // Validate that weights sum to 1.0
      const weightSum = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(weightSum - 1.0) > 0.01) {
        return res.status(400).json({
          error: true,
          message: 'Weights must sum to 1.0',
          currentSum: weightSum
        });
      }

      const result = await configurationService.createConfiguration({
        name,
        weights,
        phrases,
        isActive: isActive || false
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Configuration created successfully',
          data: result.configuration
        });
      } else {
        res.status(400).json({
          error: true,
          message: result.error,
          details: result.details
        });
      }

    } catch (error) {
      console.error('❌ Error creating configuration:', error);
      next(error);
    }
  }
);

/**
 * PUT /api/configuration/:id
 * Update an existing configuration
 */
router.put('/:id',
  [
    body('name').optional().notEmpty().withMessage('Configuration name cannot be empty'),
    body('weights').optional().isObject().withMessage('Weights must be an object'),
    body('phrases').optional().isObject().withMessage('Phrases must be an object'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: true,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updates = req.body;

      // Validate weights if provided
      if (updates.weights) {
        const weightSum = Object.values(updates.weights).reduce((sum, weight) => sum + weight, 0);
        if (Math.abs(weightSum - 1.0) > 0.01) {
          return res.status(400).json({
            error: true,
            message: 'Weights must sum to 1.0',
            currentSum: weightSum
          });
        }
      }

      const result = await configurationService.updateConfiguration(parseInt(id), updates);

      if (result.success) {
        res.json({
          success: true,
          message: 'Configuration updated successfully',
          data: result.configuration
        });
      } else {
        res.status(400).json({
          error: true,
          message: result.error,
          details: result.details
        });
      }

    } catch (error) {
      console.error('❌ Error updating configuration:', error);
      next(error);
    }
  }
);

/**
 * DELETE /api/configuration/:id
 * Delete a configuration
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await configurationService.deleteConfiguration(parseInt(id));

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        error: true,
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error deleting configuration:', error);
    next(error);
  }
});

/**
 * POST /api/configuration/:id/activate
 * Activate a configuration
 */
router.post('/:id/activate', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await configurationService.activateConfiguration(parseInt(id));

    if (result.success) {
      res.json({
        success: true,
        message: 'Configuration activated successfully',
        data: result.configuration
      });
    } else {
      res.status(400).json({
        error: true,
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error activating configuration:', error);
    next(error);
  }
});

/**
 * POST /api/configuration/reset
 * Reset to default configuration
 */
router.post('/reset', async (req, res, next) => {
  try {
    const result = await configurationService.resetToDefault();

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.configuration
      });
    } else {
      res.status(400).json({
        error: true,
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error resetting to default configuration:', error);
    next(error);
  }
});

/**
 * GET /api/configuration/:id/export
 * Export a configuration
 */
router.get('/:id/export', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await configurationService.exportConfiguration(parseInt(id));

    if (result.success) {
      res.json({
        success: true,
        data: result.configuration
      });
    } else {
      res.status(400).json({
        error: true,
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error exporting configuration:', error);
    next(error);
  }
});

/**
 * POST /api/configuration/import
 * Import a configuration
 */
router.post('/import',
  [
    body('name').notEmpty().withMessage('Configuration name is required'),
    body('weights').isObject().withMessage('Weights must be an object'),
    body('phrases').isObject().withMessage('Phrases must be an object')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: true,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, weights, phrases } = req.body;

      const result = await configurationService.importConfiguration({
        name,
        weights,
        phrases
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: result.configuration
        });
      } else {
        res.status(400).json({
          error: true,
          message: result.error,
          details: result.details
        });
      }

    } catch (error) {
      console.error('❌ Error importing configuration:', error);
      next(error);
    }
  }
);

/**
 * GET /api/configuration/default
 * Get default configuration
 */
router.get('/default', async (req, res, next) => {
  try {
    const defaultConfig = configurationService.getDefaultConfiguration();

    res.json({
      success: true,
      data: defaultConfig
    });

  } catch (error) {
    console.error('❌ Error getting default configuration:', error);
    next(error);
  }
});

module.exports = router;
