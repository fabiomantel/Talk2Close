/**
 * Batch Processing Routes
 * API endpoints for managing batch processing jobs and file operations
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const batchProcessingService = require('../services/BatchProcessingService');
const batchConfigurationService = require('../services/BatchConfigurationService');
const fileStatusTrackingService = require('../services/FileStatusTrackingService');
const { prisma } = require('../database/connection');

const router = express.Router();

/**
 * GET /api/batch/jobs
 * List all batch processing jobs
 */
router.get('/jobs', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, folderId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (folderId) {
      where.folderId = parseInt(folderId);
    }

    const [jobs, total] = await Promise.all([
      prisma.batchJob.findMany({
        where,
        include: {
          folder: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              fileRecords: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.batchJob.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error listing batch jobs:', error);
    next(error);
  }
});

/**
 * POST /api/batch/jobs
 * Create and start a new batch processing job
 */
router.post('/jobs', 
  [
    body('folderId').isInt().withMessage('Valid folder ID is required'),
    body('options').optional().isObject().withMessage('Options must be an object')
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

      const { folderId, options = {} } = req.body;

      // Start batch processing
      const result = await batchProcessingService.startBatchProcessing(folderId, options);

      res.json({
        success: true,
        data: result,
        message: 'Batch processing job started successfully'
      });

    } catch (error) {
      console.error('❌ Error starting batch job:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * GET /api/batch/jobs/:id
 * Get batch job details
 */
router.get('/jobs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.batchJob.findUnique({
      where: { id: parseInt(id) },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            storageConfig: true,
            monitorConfig: true,
            processingConfig: true
          }
        },
        fileRecords: {
          select: {
            id: true,
            fileName: true,
            status: true,
            errorCode: true,
            errorMessage: true,
            retryCount: true,
            processingStartedAt: true,
            processingCompletedAt: true,
            salesCall: {
              select: {
                id: true,
                overallScore: true,
                customer: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Batch job not found'
      });
    }

    // Get processing statistics
    const stats = await fileStatusTrackingService.getFileProcessingStats({
      batchJobId: job.id
    });

    res.json({
      success: true,
      data: {
        job,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('❌ Error getting batch job:', error);
    next(error);
  }
});

/**
 * PUT /api/batch/jobs/:id/cancel
 * Cancel a running batch job
 */
router.put('/jobs/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;

    await batchProcessingService.stopBatchProcessing(parseInt(id));

    res.json({
      success: true,
      message: 'Batch job cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Error cancelling batch job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/batch/jobs/:id/retry
 * Retry failed files in a batch job
 */
router.post('/jobs/:id/retry', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get failed file records
    const failedRecords = await prisma.fileProcessingRecord.findMany({
      where: {
        batchJobId: parseInt(id),
        status: 'failed'
      }
    });

    if (failedRecords.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No failed files to retry'
      });
    }

    // Retry each failed file
    const retryPromises = failedRecords.map(record => 
      fileStatusTrackingService.retryFileProcessing(record.id)
    );

    await Promise.all(retryPromises);

    res.json({
      success: true,
      message: `Retrying ${failedRecords.length} failed files`,
      data: {
        retriedCount: failedRecords.length
      }
    });

  } catch (error) {
    console.error('❌ Error retrying batch job files:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/batch/files
 * List file processing records
 */
router.get('/files', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      batchJobId,
      status,
      fileName,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      batchJobId: batchJobId ? parseInt(batchJobId) : undefined,
      status,
      fileName,
      sortBy,
      sortOrder
    };

    const result = await fileStatusTrackingService.listFileRecords(options);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error listing file records:', error);
    next(error);
  }
});

/**
 * GET /api/batch/files/:id
 * Get detailed file processing information
 */
router.get('/files/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await fileStatusTrackingService.getFileRecord(parseInt(id));

    res.json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error('❌ Error getting file record:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/batch/files/:id/retry
 * Retry specific failed file
 */
router.post('/files/:id/retry', async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedRecord = await fileStatusTrackingService.retryFileProcessing(parseInt(id));

    res.json({
      success: true,
      message: 'File marked for retry',
      data: updatedRecord
    });

  } catch (error) {
    console.error('❌ Error retrying file:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/batch/files/:id/logs
 * Get processing logs for file
 */
router.get('/files/:id/logs', async (req, res, next) => {
  try {
    const { id } = req.params;

    const logs = await fileStatusTrackingService.getFileProcessingLogs(parseInt(id));

    res.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('❌ Error getting file logs:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/batch/files/:id/error-details
 * Get detailed error information
 */
router.get('/files/:id/error-details', async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await prisma.fileProcessingRecord.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        fileName: true,
        status: true,
        errorCode: true,
        errorMessage: true,
        errorDetails: true,
        retryCount: true,
        maxRetries: true,
        processingStartedAt: true,
        processingCompletedAt: true
      }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'File record not found'
      });
    }

    // Get error code descriptions
    const errorDescriptions = fileStatusTrackingService.getErrorCodeDescriptions();

    res.json({
      success: true,
      data: {
        record,
        errorDescriptions,
        statusDescriptions: fileStatusTrackingService.getStatusDescriptions()
      }
    });

  } catch (error) {
    console.error('❌ Error getting error details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/batch/stats
 * Get batch processing statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const { timeRange } = req.query;

    const stats = await fileStatusTrackingService.getFileProcessingStats({
      timeRange: timeRange ? parseInt(timeRange) : undefined
    });

    // Get active batch jobs
    const activeJobs = batchProcessingService.getActiveBatchJobs();

    res.json({
      success: true,
      data: {
        fileProcessing: stats,
        activeJobs: activeJobs.length,
        systemStatus: {
          isProcessing: activeJobs.length > 0,
          activeJobCount: activeJobs.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting batch stats:', error);
    next(error);
  }
});

/**
 * GET /api/batch/status
 * Get overall batch processing system status
 */
router.get('/status', async (req, res, next) => {
  try {
    const activeJobs = batchProcessingService.getActiveBatchJobs();
    
    // Get recent batch jobs
    const recentJobs = await prisma.batchJob.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        folder: {
          select: {
            name: true
          }
        }
      }
    });

    // Get overall statistics
    const overallStats = await fileStatusTrackingService.getFileProcessingStats();

    res.json({
      success: true,
      data: {
        systemStatus: {
          isProcessing: activeJobs.length > 0,
          activeJobCount: activeJobs.length,
          activeJobIds: activeJobs
        },
        recentJobs,
        overallStats
      }
    });

  } catch (error) {
    console.error('❌ Error getting batch status:', error);
    next(error);
  }
});

module.exports = router;
