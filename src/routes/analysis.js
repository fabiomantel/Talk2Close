const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../database/connection');
const fs = require('fs-extra');
const whisperService = require('../services/whisperService');
const scoringService = require('../services/scoringService');
const enhancedScoringService = require('../services/enhancedScoringService');
const debugTrackingService = require('../services/debugTrackingService');

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze an uploaded audio file
 */
router.post('/', 
  [
    body('salesCallId').isInt().withMessage('Valid sales call ID is required'),
    body('useEnhancedAnalysis').optional().isBoolean().withMessage('useEnhancedAnalysis must be a boolean')
  ],
  async (req, res, next) => {
    // Start debug tracking
    const sessionId = debugTrackingService.startSession(null, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      analysisType: 'manual'
    });

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

      const { salesCallId, useEnhancedAnalysis = true } = req.body;

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
      console.log(`🤖 Enhanced analysis: ${useEnhancedAnalysis}`);

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
        tokensUsed: null,
        cost: null
      });

      // Get transcription statistics
      const stats = whisperService.getTranscriptionStats(transcription);

      // Track scoring analysis
      debugTrackingService.trackScoring(sessionId, {
        transcript: transcription.text,
        duration: transcription.duration || 0,
        wordCount: stats.wordCount || 0,
        analysisType: useEnhancedAnalysis ? 'enhanced' : 'traditional',
        useEnhancedAnalysis
      });

      // Perform scoring analysis (enhanced or traditional)
      let scoringResults;
      let analysisVersion = 'traditional-v1.0';
      let gpt4AnalysisUsed = false;

      if (useEnhancedAnalysis) {
        try {
          // Track GPT-4 analysis
          debugTrackingService.trackGPT4(sessionId, {
            transcript: transcription.text,
            analysisTypes: ['context', 'sentiment', 'flow']
          });

          scoringResults = await enhancedScoringService.analyzeTranscript(
            transcription.text,
            transcription.duration || 0,
            stats.wordCount || 0
          );
          analysisVersion = scoringResults.metadata.analysisVersion;
          gpt4AnalysisUsed = scoringResults.metadata.gpt4Used;

          // Complete GPT-4 tracking
          debugTrackingService.completeGPT4(sessionId, {
            success: true,
            overallConfidence: scoringResults.metadata.gpt4Confidence || 0,
            errors: []
          });
        } catch (error) {
          console.warn('⚠️ Enhanced analysis failed, falling back to traditional analysis:', error.message);
          
          // Complete GPT-4 tracking with error
          debugTrackingService.completeGPT4(sessionId, {
            success: false,
            error: error.message,
            errors: [error.message]
          });

          scoringResults = scoringService.analyzeTranscript(
            transcription.text,
            transcription.duration || 0,
            stats.wordCount || 0
          );
        }
      } else {
        scoringResults = scoringService.analyzeTranscript(
          transcription.text,
          transcription.duration || 0,
          stats.wordCount || 0
        );
      }

      // Complete scoring tracking
      debugTrackingService.completeScoring(sessionId, scoringResults);

      // Prepare enhanced analysis data
      const enhancedData = {
        sentimentScore: scoringResults.analysis.gpt4Analysis?.sentiment?.confidence || null,
        conversationPhases: scoringResults.analysis.gpt4Analysis?.conversationFlow?.phases || null,
        speakerAnalysis: scoringResults.analysis.gpt4Analysis?.contextInsights || null,
        objectionAnalysis: scoringResults.analysis.gpt4Analysis?.contextInsights?.objections || null,
        contextInsights: scoringResults.analysis.gpt4Analysis?.contextInsights || null,
        analysisConfidence: scoringResults.metadata.gpt4Confidence || null,
        enhancedNotes: scoringResults.analysis.enhancedNotes || scoringResults.analysis.notes,
        analysisVersion: analysisVersion,
        gpt4AnalysisUsed: gpt4AnalysisUsed
      };

      // Track database update
      debugTrackingService.trackDatabase(sessionId, {
        operation: 'update',
        table: 'sales_calls',
        recordId: parseInt(salesCallId),
        dataSize: JSON.stringify(enhancedData).length
      });

      // Update sales call with transcript and scores
      const updatedSalesCall = await prisma.salesCall.update({
        where: { id: parseInt(salesCallId) },
        data: {
          transcript: transcription.text,
          urgencyScore: scoringResults.scores.urgency,
          budgetScore: scoringResults.scores.budget,
          interestScore: scoringResults.scores.interest,
          engagementScore: scoringResults.scores.engagement,
          overallScore: scoringResults.scores.overall,
          analysisNotes: scoringResults.analysis.notes,
          // Enhanced analysis fields
          ...enhancedData
        },
        include: {
          customer: true
        }
      });

      // Complete database tracking
      debugTrackingService.completeDatabase(sessionId, {
        success: true,
        recordId: parseInt(salesCallId),
        affectedRows: 1
      });

      // Complete session tracking
      debugTrackingService.completeSession(sessionId, {
        success: true,
        salesCallId: parseInt(salesCallId),
        overallScore: scoringResults.scores.overall
      });

      console.log(`✅ Analysis completed for sales call ID: ${salesCallId}`);
      console.log(`📊 Transcription stats:`, stats);
      console.log(`🎯 Scoring results:`, scoringResults.scores);
      console.log(`🤖 Analysis version: ${analysisVersion}`);

              res.json({
          success: true,
          message: 'Audio analysis and scoring completed successfully',
          data: {
            salesCallId: updatedSalesCall.id,
            ...(debugTrackingService.isDebugEnabled() && { sessionId: sessionId }), // Include session ID only if debug is enabled
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
            scoring: {
              scores: scoringResults.scores,
              analysis: scoringResults.analysis,
              metadata: scoringResults.metadata
            },
            enhancedAnalysis: {
              version: analysisVersion,
              gpt4Used: gpt4AnalysisUsed,
              confidence: enhancedData.analysisConfidence,
              sentiment: scoringResults.analysis.gpt4Analysis?.sentiment,
              conversationFlow: scoringResults.analysis.gpt4Analysis?.conversationFlow,
              contextInsights: enhancedData.contextInsights
            },
            analysisStatus: 'completed',
            scoringStatus: 'completed'
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

    // Perform scoring analysis
    const scoringResults = scoringService.analyzeTranscript(
      transcription.text,
      transcription.duration || 0,
      stats.wordCount || 0
    );

    // Update with new transcript and scores
    const updatedSalesCall = await prisma.salesCall.update({
      where: { id: parseInt(id) },
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

    console.log(`✅ Retry analysis completed for sales call ID: ${id}`);
    console.log(`🎯 Scoring results:`, scoringResults.scores);

    res.json({
      success: true,
      message: 'Analysis retry and scoring completed successfully',
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
        scoring: {
          scores: scoringResults.scores,
          analysis: scoringResults.analysis,
          metadata: scoringResults.metadata
        },
        analysisStatus: 'completed',
        scoringStatus: 'completed'
      }
    });

  } catch (error) {
    console.error('❌ Retry analysis error:', error);
    next(error);
  }
});

/**
 * POST /api/analyze/:id/score
 * Score an existing transcript (for transcripts without scores)
 */
router.post('/:id/score', async (req, res, next) => {
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

    if (!salesCall.transcript) {
      return res.status(400).json({
        error: true,
        message: 'No transcript available for scoring'
      });
    }

    if (salesCall.overallScore !== null) {
      return res.status(400).json({
        error: true,
        message: 'Sales call has already been scored'
      });
    }

    console.log(`🎯 Scoring transcript for sales call ID: ${id}`);

    // Get transcription stats
    const stats = whisperService.getTranscriptionStats({
      text: salesCall.transcript,
      duration: null // We don't store duration in DB yet
    });

    // Perform scoring analysis
    const scoringResults = scoringService.analyzeTranscript(
      salesCall.transcript,
      0, // Duration not available
      stats.wordCount || 0
    );

    // Update with scores
    const updatedSalesCall = await prisma.salesCall.update({
      where: { id: parseInt(id) },
      data: {
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

    console.log(`✅ Scoring completed for sales call ID: ${id}`);
    console.log(`🎯 Scoring results:`, scoringResults.scores);

    res.json({
      success: true,
      message: 'Transcript scoring completed successfully',
      data: {
        salesCallId: updatedSalesCall.id,
        customer: {
          id: updatedSalesCall.customer.id,
          name: updatedSalesCall.customer.name,
          phone: updatedSalesCall.customer.phone
        },
        scoring: {
          scores: scoringResults.scores,
          analysis: scoringResults.analysis,
          metadata: scoringResults.metadata
        },
        scoringStatus: 'completed'
      }
    });

  } catch (error) {
    console.error('❌ Scoring error:', error);
    next(error);
  }
});

module.exports = router; 