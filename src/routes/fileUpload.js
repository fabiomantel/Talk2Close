const express = require('express');
const { body, validationResult } = require('express-validator');
const { upload, handleUploadError, cleanupOnError } = require('../middleware/fileUpload');
const { prisma } = require('../database/connection');
const fs = require('fs-extra');
const path = require('path');
const whisperService = require('../services/whisperService');
const scoringService = require('../services/scoringService');
const debugTrackingService = require('../services/debugTrackingService');

const router = express.Router();

/**
 * POST /api/upload
 * Upload an audio file
 */
router.post('/', 
  upload.single('audio'),
  cleanupOnError,
  handleUploadError,
  [
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('customerPhone').notEmpty().withMessage('Customer phone is required'),
    body('customerEmail').optional().isEmail().withMessage('Invalid email format')
  ],
  async (req, res, next) => {
    // Start debug tracking
    const sessionId = debugTrackingService.startSession(null, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up uploaded file if validation fails
        if (req.file) {
          await fs.remove(req.file.path);
        }
        return res.status(400).json({
          error: true,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: true,
          message: 'No audio file uploaded'
        });
      }

      const { customerName, customerPhone, customerEmail } = req.body;

      // Track upload start
      debugTrackingService.trackUpload(sessionId, {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        customerName,
        customerPhone,
        customerEmail,
        uploadPath: req.file.path,
        deviceInfo: req.get('User-Agent'),
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });

      // Create or find customer
      let customer = await prisma.customer.findFirst({
        where: {
          phone: customerPhone
        }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null
          }
        });
      }

      // Track database operation
      debugTrackingService.trackDatabase(sessionId, {
        operation: 'create',
        table: 'sales_calls',
        recordId: null,
        dataSize: JSON.stringify({ customerId: customer.id, audioFilePath: req.file.path }).length
      });

      // Create sales call record
      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: req.file.path,
          createdAt: new Date()
        },
        include: {
          customer: true
        }
      });

      // Complete database tracking
      debugTrackingService.completeDatabase(sessionId, {
        success: true,
        recordId: salesCall.id,
        affectedRows: 1
      });

      console.log(`✅ File uploaded successfully: ${req.file.originalname}`);
      console.log(`👤 Customer: ${customer.name} (${customer.phone})`);
      console.log(`📁 Stored at: ${req.file.path}`);

      // Complete upload tracking
      debugTrackingService.completeUpload(sessionId, {
        success: true,
        salesCallId: salesCall.id,
        databaseRecord: salesCall
      });

      // Automatically trigger analysis after successful upload
      console.log(`🔍 Starting automatic analysis for sales call ID: ${salesCall.id}`);
      
      try {
        // Track Whisper API call
        const fileStats = await fs.stat(salesCall.audioFilePath);
        debugTrackingService.trackWhisper(sessionId, {
          filePath: salesCall.audioFilePath,
          fileSize: fileStats.size,
          model: 'whisper-1',
          language: 'he',
          responseFormat: 'verbose_json',
          timestampGranularities: ['word']
        });

        // Validate audio file
        await whisperService.validateAudioFile(salesCall.audioFilePath);

        // Transcribe audio using Whisper API
        const transcription = await whisperService.transcribeAudio(salesCall.audioFilePath);

        // Complete Whisper tracking
        debugTrackingService.completeWhisper(sessionId, {
          success: true,
          text: transcription.text,
          language: transcription.language,
          duration: transcription.duration,
          segments: transcription.segments,
          tokensUsed: null, // Whisper doesn't return token usage
          cost: null
        });

        // Get transcription statistics
        const stats = whisperService.getTranscriptionStats(transcription);

        // Track scoring analysis
        debugTrackingService.trackScoring(sessionId, {
          transcript: transcription.text,
          duration: transcription.duration || 0,
          wordCount: stats.wordCount || 0,
          analysisType: 'traditional',
          useEnhancedAnalysis: false
        });

        // Perform scoring analysis
        const scoringResults = scoringService.analyzeTranscript(
          transcription.text,
          transcription.duration || 0,
          stats.wordCount || 0
        );

        // Complete scoring tracking
        debugTrackingService.completeScoring(sessionId, scoringResults);

        // Track database update
        debugTrackingService.trackDatabase(sessionId, {
          operation: 'update',
          table: 'sales_calls',
          recordId: salesCall.id,
          dataSize: JSON.stringify({
            transcript: transcription.text,
            urgencyScore: scoringResults.scores.urgency,
            budgetScore: scoringResults.scores.budget,
            interestScore: scoringResults.scores.interest,
            engagementScore: scoringResults.scores.engagement,
            overallScore: scoringResults.scores.overall,
            analysisNotes: scoringResults.analysis.notes
          }).length
        });

        // Update sales call with transcript and scores
        const updatedSalesCall = await prisma.salesCall.update({
          where: { id: salesCall.id },
          data: {
            transcript: transcription.text,
            urgencyScore: scoringResults.scores.urgency,
            budgetScore: scoringResults.scores.budget,
            interestScore: scoringResults.scores.interest,
            engagementScore: scoringResults.scores.engagement,
            overallScore: scoringResults.scores.overall,
            analysisNotes: scoringResults.analysis.notes
          },
          include: {
            customer: true
          }
        });

        // Complete database tracking
        debugTrackingService.completeDatabase(sessionId, {
          success: true,
          recordId: salesCall.id,
          affectedRows: 1
        });

        // Complete session tracking
        debugTrackingService.completeSession(sessionId, {
          success: true,
          salesCallId: salesCall.id,
          overallScore: scoringResults.scores.overall
        });

        console.log(`✅ Automatic analysis completed for sales call ID: ${salesCall.id}`);
        console.log(`📊 Transcription stats:`, stats);
        console.log(`🎯 Scoring results:`, scoringResults.scores);

        res.status(201).json({
          success: true,
          message: 'Audio file uploaded and analyzed successfully',
          data: {
            salesCallId: salesCall.id,
            ...(debugTrackingService.isDebugEnabled() && { sessionId: sessionId }), // Include session ID only if debug is enabled
            customer: {
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email
            },
            file: {
              originalName: req.file.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype,
              path: req.file.path
            },
            transcription: {
              text: transcription.text,
              duration: transcription.duration || 0,
              wordCount: stats.wordCount || 0
            },
            scoring: {
              scores: scoringResults.scores,
              analysis: scoringResults.analysis,
              metadata: scoringResults.metadata
            },
            analysisStatus: 'completed',
            scoringStatus: 'completed',
            uploadedAt: salesCall.createdAt
          }
        });

      } catch (analysisError) {
        console.error(`❌ Analysis failed for sales call ID: ${salesCall.id}`, analysisError);
        
        // Still return success for upload, but indicate analysis failed
        res.status(201).json({
          success: true,
          message: 'Audio file uploaded successfully, but analysis failed',
          data: {
            salesCallId: salesCall.id,
            customer: {
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email
            },
            file: {
              originalName: req.file.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype,
              path: req.file.path
            },
            analysisStatus: 'failed',
            analysisError: analysisError.message,
            uploadedAt: salesCall.createdAt
          }
        });
      }

    } catch (error) {
      console.error('❌ File upload error:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        await fs.remove(req.file.path).catch(err => {
          console.error('Error cleaning up file:', err);
        });
      }

      next(error);
    }
  }
);

/**
 * GET /api/upload
 * List uploaded files
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, customerId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    const [salesCalls, total] = await Promise.all([
      prisma.salesCall.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.salesCall.count({ where })
    ]);

    // Add file information
    const filesWithInfo = await Promise.all(
      salesCalls.map(async (call) => {
        try {
          const stats = await fs.stat(call.audioFilePath);
          return {
            ...call,
            file: {
              exists: true,
              size: stats.size,
              sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
              lastModified: stats.mtime
            }
          };
        } catch (error) {
          return {
            ...call,
            file: {
              exists: false,
              error: 'File not found'
            }
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        files: filesWithInfo,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error listing files:', error);
    next(error);
  }
});

/**
 * DELETE /api/upload/:id
 * Delete uploaded file
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the sales call
    const salesCall = await prisma.salesCall.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true
      }
    });

    if (!salesCall) {
      return res.status(404).json({
        error: true,
        message: 'Sales call not found'
      });
    }

    // Delete the file from filesystem
    try {
      await fs.remove(salesCall.audioFilePath);
      console.log(`🗑️ File deleted: ${salesCall.audioFilePath}`);
    } catch (fileError) {
      console.warn(`⚠️ File not found on filesystem: ${salesCall.audioFilePath}`);
    }

    // Delete from database
    await prisma.salesCall.delete({
      where: { id: parseInt(id) }
    });

    console.log(`✅ Sales call deleted: ID ${id}`);

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: {
        deletedId: parseInt(id),
        customerName: salesCall.customer.name
      }
    });

  } catch (error) {
    console.error('❌ Error deleting file:', error);
    next(error);
  }
});

/**
 * GET /api/upload/:id
 * Get specific file details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const salesCall = await prisma.salesCall.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    if (!salesCall) {
      return res.status(404).json({
        error: true,
        message: 'Sales call not found'
      });
    }

    // Get file information
    let fileInfo = { exists: false };
    try {
      const stats = await fs.stat(salesCall.audioFilePath);
      fileInfo = {
        exists: true,
        size: stats.size,
        sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
        lastModified: stats.mtime,
        filename: path.basename(salesCall.audioFilePath)
      };
    } catch (error) {
      fileInfo.error = 'File not found on filesystem';
    }

    res.json({
      success: true,
      data: {
        ...salesCall,
        file: fileInfo
      }
    });

  } catch (error) {
    console.error('❌ Error getting file details:', error);
    next(error);
  }
});

module.exports = router; 