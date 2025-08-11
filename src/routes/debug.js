/**
 * Debug Dashboard Routes
 * Provides API endpoints for debug tracking and monitoring
 */

const express = require('express');
const debugTrackingService = require('../services/debugTrackingService');

const router = express.Router();

// Middleware to check if debug tracking is enabled
const requireDebugEnabled = (req, res, next) => {
  if (!debugTrackingService.isDebugEnabled()) {
    return res.status(404).json({
      error: true,
      message: 'Debug tracking is not enabled'
    });
  }
  next();
};

// Apply middleware to all debug routes
router.use(requireDebugEnabled);

/**
 * GET /api/debug/sessions
 * Get all debug sessions
 */
router.get('/sessions', (req, res) => {
  try {
    const sessions = debugTrackingService.getAllSessions();
    
    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          sessionId: session.sessionId,
          startTime: session.startTime,
          endTime: session.endTime,
          totalDuration: session.totalDuration,
          status: session.status,
          customerName: session.upload?.customerName || 'Unknown',
          fileName: session.upload?.fileName || 'Unknown',
          overallScore: session.scoring?.scores?.overall || null,
          uploadDuration: session.upload?.duration || 0,
          whisperDuration: session.whisper?.duration || 0,
          gpt4Duration: session.gpt4?.duration || 0,
          scoringDuration: session.scoring?.duration || 0,
          databaseDuration: session.database?.duration || 0
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error getting debug sessions:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to get debug sessions'
    });
  }
});

/**
 * GET /api/debug/sessions/:sessionId
 * Get detailed session data
 */
router.get('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = debugTrackingService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: true,
        message: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        session
      }
    });
  } catch (error) {
    console.error('❌ Error getting session details:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to get session details'
    });
  }
});

/**
 * GET /api/debug/metrics
 * Get performance metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = debugTrackingService.getPerformanceMetrics();
    
    res.json({
      success: true,
      data: {
        metrics
      }
    });
  } catch (error) {
    console.error('❌ Error getting performance metrics:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to get performance metrics'
    });
  }
});

/**
 * POST /api/debug/clear-sessions
 * Clear old debug sessions
 */
router.post('/clear-sessions', (req, res) => {
  try {
    debugTrackingService.clearOldSessions();
    
    res.json({
      success: true,
      message: 'Old sessions cleared successfully'
    });
  } catch (error) {
    console.error('❌ Error clearing sessions:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to clear sessions'
    });
  }
});

/**
 * GET /api/debug/status
 * Get debug tracking status
 */
router.get('/status', (req, res) => {
  try {
    const isEnabled = process.env.DEBUG_TRACKING === 'true';
    const sessions = debugTrackingService.getAllSessions();
    
    res.json({
      success: true,
      data: {
        isEnabled,
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === 'started').length,
        completedSessions: sessions.filter(s => s.status === 'completed').length,
        failedSessions: sessions.filter(s => s.status === 'failed').length
      }
    });
  } catch (error) {
    console.error('❌ Error getting debug status:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to get debug status'
    });
  }
});

module.exports = router;
