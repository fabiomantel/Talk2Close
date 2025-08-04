const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../database/connection');
const whisperService = require('../services/whisperService');

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze an uploaded audio file
 */
router.post('/', 
  [
    body('salesCallId').isInt().withMessage('Valid sales call ID is required')
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

      const { salesCallId } = req.body;

      // Find the sales call
      const salesCall = await prisma.salesCall.findUnique({
        where: { id: parseInt(salesCallId) },
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

      // Check if already analyzed
      if (salesCall.transcript) {
        return res.status(400).json({
          error: true,
          message: 'Sales call has already been analyzed',
          data: {
            salesCallId: salesCall.id,
            hasTranscript: true,
            hasScores: !!(salesCall.overallScore)
          }
        });
      }

      console.log(`🔍 Starting analysis for sales call ID: ${salesCallId}`);
      console.log(`👤 Customer: ${salesCall.customer.name}`);
      console.log(`📁 Audio file: ${salesCall.audioFilePath}`);

      // Validate audio file
      await whisperService.validateAudioFile(salesCall.audioFilePath);

      // Transcribe audio using Whisper API
      const transcription = await whisperService.transcribeAudio(salesCall.audioFilePath);

      // Get transcription statistics
      const stats = whisperService.getTranscriptionStats(transcription);

      // Update sales call with transcript
      const updatedSalesCall = await prisma.salesCall.update({
        where: { id: parseInt(salesCallId) },
        data: {
          transcript: transcription.text
        },
        include: {
          customer: true
        }
      });

      console.log(`✅ Analysis completed for sales call ID: ${salesCallId}`);
      console.log(`📊 Transcription stats:`, stats);

      res.json({
        success: true,
        message: 'Audio analysis completed successfully',
        data: {
          salesCallId: updatedSalesCall.id,
          customer: {
            id: updatedSalesCall.customer.id,
            name: updatedSalesCall.customer.name,
            phone: updatedSalesCall.customer.phone
          },
          transcription: {
            text: transcription.text,
            language: transcription.language,
            duration: transcription.duration,
            stats: stats
          },
          analysisStatus: 'transcribed',
          nextStep: 'Calculate scores using scoring algorithm'
        }
      });

    } catch (error) {
      console.error('❌ Analysis error:', error);
      next(error);
    }
  }
);

/**
 * GET /api/analyze/:id
 * Get analysis results for a specific sales call
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

    // Calculate transcription stats if transcript exists
    let transcriptionStats = null;
    if (salesCall.transcript) {
      transcriptionStats = whisperService.getTranscriptionStats({
        text: salesCall.transcript,
        duration: null // We don't store duration in DB yet
      });
    }

    res.json({
      success: true,
      data: {
        ...salesCall,
        transcriptionStats,
        analysisStatus: salesCall.transcript ? 'transcribed' : 'pending',
        scoringStatus: salesCall.overallScore ? 'completed' : 'pending'
      }
    });

  } catch (error) {
    console.error('❌ Error getting analysis results:', error);
    next(error);
  }
});

/**
 * GET /api/analyze
 * List all analyses with pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, customerId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    if (status === 'transcribed') {
      where.transcript = { not: null };
    } else if (status === 'pending') {
      where.transcript = null;
    } else if (status === 'scored') {
      where.overallScore = { not: null };
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

    // Add analysis status and stats to each call
    const callsWithStatus = salesCalls.map(call => {
      const transcriptionStats = call.transcript ? 
        whisperService.getTranscriptionStats({ text: call.transcript }) : null;

      return {
        ...call,
        analysisStatus: call.transcript ? 'transcribed' : 'pending',
        scoringStatus: call.overallScore ? 'completed' : 'pending',
        transcriptionStats
      };
    });

    res.json({
      success: true,
      data: {
        analyses: callsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          total: total,
          transcribed: callsWithStatus.filter(c => c.transcript).length,
          scored: callsWithStatus.filter(c => c.overallScore).length,
          pending: callsWithStatus.filter(c => !c.transcript).length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error listing analyses:', error);
    next(error);
  }
});

/**
 * POST /api/analyze/:id/retry
 * Retry analysis for a specific sales call
 */
router.post('/:id/retry', async (req, res, next) => {
  try {
    const { id } = req.params;

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

    console.log(`🔄 Retrying analysis for sales call ID: ${id}`);

    // Clear previous transcript and scores
    await prisma.salesCall.update({
      where: { id: parseInt(id) },
      data: {
        transcript: null,
        urgencyScore: null,
        budgetScore: null,
        interestScore: null,
        engagementScore: null,
        overallScore: null,
        analysisNotes: null
      }
    });

    // Re-analyze
    const transcription = await whisperService.transcribeAudio(salesCall.audioFilePath);
    const stats = whisperService.getTranscriptionStats(transcription);

    // Update with new transcript
    const updatedSalesCall = await prisma.salesCall.update({
      where: { id: parseInt(id) },
      data: {
        transcript: transcription.text
      },
      include: {
        customer: true
      }
    });

    console.log(`✅ Retry analysis completed for sales call ID: ${id}`);

    res.json({
      success: true,
      message: 'Analysis retry completed successfully',
      data: {
        salesCallId: updatedSalesCall.id,
        customer: {
          id: updatedSalesCall.customer.id,
          name: updatedSalesCall.customer.name,
          phone: updatedSalesCall.customer.phone
        },
        transcription: {
          text: transcription.text,
          language: transcription.language,
          duration: transcription.duration,
          stats: stats
        },
        analysisStatus: 'transcribed',
        nextStep: 'Calculate scores using scoring algorithm'
      }
    });

  } catch (error) {
    console.error('❌ Retry analysis error:', error);
    next(error);
  }
});

module.exports = router; 