/**
 * Debug Tracking Service
 * Tracks detailed metrics and data flow throughout the analysis pipeline
 */

class DebugTrackingService {
  constructor() {
    this.trackingData = new Map();
    this.isEnabled = process.env.DEBUG_TRACKING === 'true';
    
    if (!this.isEnabled) {
      console.log('🔍 Debug tracking is disabled. Set DEBUG_TRACKING=true to enable.');
    }
  }

  /**
   * Start tracking a new analysis session
   * @param {string} sessionId - Unique session identifier
   * @param {Object} initialData - Initial session data
   * @returns {string} Session ID
   */
  startSession(sessionId = null, initialData = {}) {
    if (!this.isEnabled) return sessionId;

    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.trackingData.set(id, {
      sessionId: id,
      startTime: Date.now(),
      upload: {},
      whisper: {},
      gpt4: {},
      scoring: {},
      database: {},
      totalDuration: 0,
      status: 'started',
      errors: [],
      ...initialData
    });

    console.log(`🔍 Debug tracking started for session: ${id}`);
    return id;
  }

  /**
   * Track file upload metrics
   * @param {string} sessionId - Session ID
   * @param {Object} uploadData - Upload data
   */
  trackUpload(sessionId, uploadData) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const startTime = Date.now();

    session.upload = {
      startTime,
      fileName: uploadData.fileName,
      fileSize: uploadData.fileSize,
      fileType: uploadData.fileType,
      customerName: uploadData.customerName,
      customerPhone: uploadData.customerPhone,
      customerEmail: uploadData.customerEmail,
      deviceInfo: uploadData.deviceInfo || 'Unknown',
      userAgent: uploadData.userAgent || 'Unknown',
      ipAddress: uploadData.ipAddress || 'Unknown',
      uploadPath: uploadData.uploadPath,
      duration: 0,
      status: 'started'
    };

    console.log(`📤 Debug: Upload started for session ${sessionId}`, {
      fileName: uploadData.fileName,
      fileSize: uploadData.fileSize,
      customerName: uploadData.customerName
    });
  }

  /**
   * Complete upload tracking
   * @param {string} sessionId - Session ID
   * @param {Object} result - Upload result
   */
  completeUpload(sessionId, result) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const endTime = Date.now();
    
    session.upload = {
      ...session.upload,
      endTime,
      duration: endTime - session.upload.startTime,
      status: result.success ? 'completed' : 'failed',
      salesCallId: result.salesCallId,
      error: result.error || null,
      databaseRecord: result.databaseRecord || null
    };

    console.log(`📤 Debug: Upload completed for session ${sessionId}`, {
      duration: session.upload.duration,
      status: session.upload.status,
      salesCallId: session.upload.salesCallId
    });
  }

  /**
   * Track Whisper API call
   * @param {string} sessionId - Session ID
   * @param {Object} whisperData - Whisper API data
   */
  trackWhisper(sessionId, whisperData) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const startTime = Date.now();

    session.whisper = {
      startTime,
      filePath: whisperData.filePath,
      fileSize: whisperData.fileSize,
      request: {
        model: whisperData.model || 'whisper-1',
        language: whisperData.language || 'he',
        responseFormat: whisperData.responseFormat || 'verbose_json',
        timestampGranularities: whisperData.timestampGranularities || ['word']
      },
      duration: 0,
      status: 'started'
    };

    console.log(`🎤 Debug: Whisper API call started for session ${sessionId}`, {
      filePath: whisperData.filePath,
      fileSize: whisperData.fileSize,
      request: session.whisper.request
    });
  }

  /**
   * Complete Whisper tracking
   * @param {string} sessionId - Session ID
   * @param {Object} result - Whisper API result
   */
  completeWhisper(sessionId, result) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const endTime = Date.now();
    
    session.whisper = {
      ...session.whisper,
      endTime,
      duration: endTime - session.whisper.startTime,
      status: result.success ? 'completed' : 'failed',
      response: {
        text: result.text,
        language: result.language,
        duration: result.duration,
        segments: result.segments ? result.segments.length : 0,
        wordCount: result.text ? result.text.split(' ').length : 0,
        characterCount: result.text ? result.text.length : 0
      },
      error: result.error || null,
      tokensUsed: result.tokensUsed || null,
      cost: result.cost || null
    };

    console.log(`🎤 Debug: Whisper API completed for session ${sessionId}`, {
      duration: session.whisper.duration,
      status: session.whisper.status,
      wordCount: session.whisper.response.wordCount,
      tokensUsed: session.whisper.tokensUsed
    });
  }

  /**
   * Track GPT-4 analysis
   * @param {string} sessionId - Session ID
   * @param {Object} gpt4Data - GPT-4 analysis data
   */
  trackGPT4(sessionId, gpt4Data) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const startTime = Date.now();

    session.gpt4 = {
      startTime,
      transcript: gpt4Data.transcript,
      transcriptLength: gpt4Data.transcript.length,
      wordCount: gpt4Data.transcript.split(' ').length,
      analysisTypes: gpt4Data.analysisTypes || ['context', 'sentiment', 'flow'],
      requests: [],
      duration: 0,
      status: 'started'
    };

    console.log(`🤖 Debug: GPT-4 analysis started for session ${sessionId}`, {
      transcriptLength: gpt4Data.transcript.length,
      wordCount: gpt4Data.transcript.split(' ').length,
      analysisTypes: session.gpt4.analysisTypes
    });
  }

  /**
   * Track individual GPT-4 request
   * @param {string} sessionId - Session ID
   * @param {string} analysisType - Type of analysis
   * @param {Object} requestData - Request data
   */
  trackGPT4Request(sessionId, analysisType, requestData) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const requestId = `${analysisType}_${Date.now()}`;
    const startTime = Date.now();

    const request = {
      id: requestId,
      type: analysisType,
      startTime,
      request: {
        model: requestData.model || 'gpt-4',
        temperature: requestData.temperature || 0.3,
        maxTokens: requestData.maxTokens || 2000,
        prompt: requestData.prompt,
        promptLength: requestData.prompt.length,
        responseFormat: requestData.responseFormat || { type: 'json_object' }
      },
      duration: 0,
      status: 'started'
    };

    session.gpt4.requests.push(request);

    console.log(`🤖 Debug: GPT-4 ${analysisType} request started for session ${sessionId}`, {
      requestId,
      promptLength: requestData.prompt.length,
      temperature: requestData.temperature
    });
  }

  /**
   * Complete GPT-4 request tracking
   * @param {string} sessionId - Session ID
   * @param {string} requestId - Request ID
   * @param {Object} result - Request result
   */
  completeGPT4Request(sessionId, requestId, result) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const request = session.gpt4.requests.find(r => r.id === requestId);
    
    if (!request) return;

    const endTime = Date.now();
    
    request.endTime = endTime;
    request.duration = endTime - request.startTime;
    request.status = result.success ? 'completed' : 'failed';
    request.response = {
      content: result.content,
      contentLength: result.content ? result.content.length : 0,
      tokensUsed: result.tokensUsed || null,
      cost: result.cost || null
    };
    request.error = result.error || null;

    console.log(`🤖 Debug: GPT-4 ${request.type} request completed for session ${sessionId}`, {
      requestId,
      duration: request.duration,
      status: request.status,
      tokensUsed: request.response.tokensUsed
    });
  }

  /**
   * Complete GPT-4 analysis tracking
   * @param {string} sessionId - Session ID
   * @param {Object} result - GPT-4 analysis result
   */
  completeGPT4(sessionId, result) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const endTime = Date.now();
    
    session.gpt4 = {
      ...session.gpt4,
      endTime,
      duration: endTime - session.gpt4.startTime,
      status: result.success ? 'completed' : 'failed',
      overallResult: {
        success: result.success,
        overallConfidence: result.overallConfidence,
        totalTokensUsed: session.gpt4.requests.reduce((sum, req) => sum + (req.response?.tokensUsed || 0), 0),
        totalCost: session.gpt4.requests.reduce((sum, req) => sum + (req.response?.cost || 0), 0),
        errors: result.errors || []
      },
      error: result.error || null
    };

    console.log(`🤖 Debug: GPT-4 analysis completed for session ${sessionId}`, {
      duration: session.gpt4.duration,
      status: session.gpt4.status,
      totalTokensUsed: session.gpt4.overallResult.totalTokensUsed,
      overallConfidence: session.gpt4.overallResult.overallConfidence
    });
  }

  /**
   * Track scoring analysis
   * @param {string} sessionId - Session ID
   * @param {Object} scoringData - Scoring data
   */
  trackScoring(sessionId, scoringData) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const startTime = Date.now();

    session.scoring = {
      startTime,
      transcript: scoringData.transcript,
      duration: scoringData.duration,
      wordCount: scoringData.wordCount,
      analysisType: scoringData.analysisType || 'traditional',
      useEnhancedAnalysis: scoringData.useEnhancedAnalysis || false,
      duration: 0,
      status: 'started'
    };

    console.log(`📊 Debug: Scoring analysis started for session ${sessionId}`, {
      analysisType: scoringData.analysisType,
      useEnhancedAnalysis: scoringData.useEnhancedAnalysis,
      wordCount: scoringData.wordCount
    });
  }

  /**
   * Complete scoring tracking
   * @param {string} sessionId - Session ID
   * @param {Object} result - Scoring result
   */
  completeScoring(sessionId, result) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const endTime = Date.now();
    
    session.scoring = {
      ...session.scoring,
      endTime,
      duration: endTime - session.scoring.startTime,
      status: 'completed',
      scores: {
        urgency: result.scores.urgency,
        budget: result.scores.budget,
        interest: result.scores.interest,
        engagement: result.scores.engagement,
        overall: result.scores.overall
      },
      analysis: {
        keyPhrases: result.analysis.keyPhrases,
        objections: result.analysis.objections,
        confidence: result.analysis.confidence,
        enhancedNotes: result.analysis.enhancedNotes
      },
      metadata: result.metadata
    };

    console.log(`📊 Debug: Scoring analysis completed for session ${sessionId}`, {
      duration: session.scoring.duration,
      overallScore: result.scores.overall,
      confidence: result.analysis.confidence
    });
  }

  /**
   * Track database operations
   * @param {string} sessionId - Session ID
   * @param {Object} dbData - Database operation data
   */
  trackDatabase(sessionId, dbData) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const startTime = Date.now();

    session.database = {
      startTime,
      operation: dbData.operation,
      table: dbData.table,
      recordId: dbData.recordId,
      dataSize: dbData.dataSize || 0,
      duration: 0,
      status: 'started'
    };

    console.log(`💾 Debug: Database operation started for session ${sessionId}`, {
      operation: dbData.operation,
      table: dbData.table,
      recordId: dbData.recordId
    });
  }

  /**
   * Complete database tracking
   * @param {string} sessionId - Session ID
   * @param {Object} result - Database operation result
   */
  completeDatabase(sessionId, result) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const endTime = Date.now();
    
    session.database = {
      ...session.database,
      endTime,
      duration: endTime - session.database.startTime,
      status: result.success ? 'completed' : 'failed',
      error: result.error || null,
      affectedRows: result.affectedRows || 1
    };

    console.log(`💾 Debug: Database operation completed for session ${sessionId}`, {
      duration: session.database.duration,
      status: session.database.status,
      affectedRows: session.database.affectedRows
    });
  }

  /**
   * Complete session tracking
   * @param {string} sessionId - Session ID
   * @param {Object} finalResult - Final analysis result
   */
  completeSession(sessionId, finalResult) {
    if (!this.isEnabled || !this.trackingData.has(sessionId)) return;

    const session = this.trackingData.get(sessionId);
    const endTime = Date.now();
    
    session.endTime = endTime;
    session.totalDuration = endTime - session.startTime;
    session.status = finalResult.success ? 'completed' : 'failed';
    session.finalResult = finalResult;

    console.log(`🔍 Debug: Session completed for session ${sessionId}`, {
      totalDuration: session.totalDuration,
      status: session.status,
      uploadDuration: session.upload.duration,
      whisperDuration: session.whisper.duration,
      gpt4Duration: session.gpt4.duration,
      scoringDuration: session.scoring.duration,
      databaseDuration: session.database.duration
    });
  }

  /**
   * Get session data
   * @param {string} sessionId - Session ID
   * @returns {Object} Session data
   */
  getSession(sessionId) {
    if (!this.isEnabled) return null;
    return this.trackingData.get(sessionId) || null;
  }

  /**
   * Get all sessions
   * @returns {Array} All session data
   */
  getAllSessions() {
    if (!this.isEnabled) return [];
    return Array.from(this.trackingData.values());
  }

  /**
   * Clear old sessions (keep last 100)
   */
  clearOldSessions() {
    if (!this.isEnabled) return;

    const sessions = Array.from(this.trackingData.entries());
    if (sessions.length > 100) {
      const toDelete = sessions.slice(0, sessions.length - 100);
      toDelete.forEach(([id]) => this.trackingData.delete(id));
      console.log(`🧹 Debug: Cleared ${toDelete.length} old sessions`);
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    if (!this.isEnabled) return {};

    const sessions = this.getAllSessions();
    const completedSessions = sessions.filter(s => s.status === 'completed');

    if (completedSessions.length === 0) return {};

    const metrics = {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      failedSessions: sessions.filter(s => s.status === 'failed').length,
      averageTotalDuration: completedSessions.reduce((sum, s) => sum + s.totalDuration, 0) / completedSessions.length,
      averageUploadDuration: completedSessions.reduce((sum, s) => sum + (s.upload.duration || 0), 0) / completedSessions.length,
      averageWhisperDuration: completedSessions.reduce((sum, s) => sum + (s.whisper.duration || 0), 0) / completedSessions.length,
      averageGPT4Duration: completedSessions.reduce((sum, s) => sum + (s.gpt4.duration || 0), 0) / completedSessions.length,
      averageScoringDuration: completedSessions.reduce((sum, s) => sum + (s.scoring.duration || 0), 0) / completedSessions.length,
      averageDatabaseDuration: completedSessions.reduce((sum, s) => sum + (s.database.duration || 0), 0) / completedSessions.length,
      totalTokensUsed: completedSessions.reduce((sum, s) => sum + (s.gpt4.overallResult?.totalTokensUsed || 0), 0),
      totalCost: completedSessions.reduce((sum, s) => sum + (s.gpt4.overallResult?.totalCost || 0), 0)
    };

    return metrics;
  }

  /**
   * Check if debug tracking is enabled
   * @returns {boolean} Whether debug tracking is enabled
   */
  isDebugEnabled() {
    return this.isEnabled;
  }
}

module.exports = new DebugTrackingService();
