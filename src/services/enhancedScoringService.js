/**
 * Enhanced Scoring Service
 * Integrates GPT-4 analysis with traditional scoring for improved accuracy
 */

const gpt4AnalysisService = require('./gpt4AnalysisService');
const scoringService = require('./scoringService');

class EnhancedScoringService {
  constructor() {
    this.baseScoringService = scoringService;
    this.gpt4Service = gpt4AnalysisService;
    
    // Enhanced scoring weights that combine traditional and AI analysis
    this.enhancedWeights = {
      traditional: 0.4,    // 40% weight for traditional scoring
      gpt4Context: 0.35,   // 35% weight for GPT-4 context analysis
      sentiment: 0.15,     // 15% weight for sentiment analysis
      flow: 0.10           // 10% weight for conversation flow
    };

    // Confidence thresholds
    this.confidenceThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
  }

  /**
   * Perform enhanced analysis combining traditional and GPT-4 analysis
   * @param {string} transcript - Hebrew transcript text
   * @param {number} duration - Call duration in seconds
   * @param {number} wordCount - Number of words in transcript
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Enhanced analysis results
   */
  async analyzeTranscript(transcript, duration = 0, wordCount = 0, options = {}) {
    try {
      console.log('🚀 Starting enhanced transcript analysis...');

      // Perform traditional analysis first
      const traditionalResults = this.baseScoringService.analyzeTranscript(
        transcript, 
        duration, 
        wordCount
      );

      // Perform GPT-4 analysis
      let gpt4Results = null;
      let gpt4Error = null;

      try {
        gpt4Results = await this.gpt4Service.performComprehensiveAnalysis(transcript);
      } catch (error) {
        console.warn('⚠️ GPT-4 analysis failed, falling back to traditional analysis:', error.message);
        gpt4Error = error.message;
      }

      // Combine results
      const enhancedResults = this.combineAnalysisResults(
        traditionalResults, 
        gpt4Results, 
        gpt4Error
      );

      console.log('✅ Enhanced analysis completed');
      
      return enhancedResults;

    } catch (error) {
      console.error('❌ Enhanced analysis failed:', error);
      throw new Error(`Enhanced analysis failed: ${error.message}`);
    }
  }

  /**
   * Combine traditional and GPT-4 analysis results
   * @param {Object} traditionalResults - Results from traditional scoring
   * @param {Object} gpt4Results - Results from GPT-4 analysis
   * @param {string} gpt4Error - Any error from GPT-4 analysis
   * @returns {Object} Combined analysis results
   */
  combineAnalysisResults(traditionalResults, gpt4Results, gpt4Error = null) {
    // Start with traditional results as base
    const enhancedScores = { ...traditionalResults.scores };
    const enhancedAnalysis = { ...traditionalResults.analysis };
    const enhancedMetadata = { ...traditionalResults.metadata };

    // If GPT-4 analysis is available, enhance the results
    if (gpt4Results && gpt4Results.success) {
      const contextInsights = gpt4Results.results.context?.analysis?.context_insights;
      const sentiment = gpt4Results.results.sentiment?.sentiment;
      const flow = gpt4Results.results.flow?.flow;

      // Enhance urgency score with context insights
      if (contextInsights?.urgency_level) {
        enhancedScores.urgency = this.enhanceScoreWithContext(
          enhancedScores.urgency,
          contextInsights.urgency_level,
          'urgency'
        );
      }

      // Enhance budget score with context insights
      if (contextInsights?.budget_clarity) {
        enhancedScores.budget = this.enhanceScoreWithContext(
          enhancedScores.budget,
          contextInsights.budget_clarity,
          'budget'
        );
      }

      // Enhance interest score with context insights
      if (contextInsights?.interest_level) {
        enhancedScores.interest = this.enhanceScoreWithContext(
          enhancedScores.interest,
          contextInsights.interest_level,
          'interest'
        );
      }

      // Enhance engagement score with context insights
      if (contextInsights?.engagement_level) {
        enhancedScores.engagement = this.enhanceScoreWithContext(
          enhancedScores.engagement,
          contextInsights.engagement_level,
          'engagement'
        );
      }

      // Recalculate overall score with enhanced individual scores
      enhancedScores.overall = this.calculateEnhancedOverallScore(enhancedScores);

      // Add GPT-4 analysis data
      enhancedAnalysis.gpt4Analysis = {
        sentiment: sentiment,
        conversationFlow: flow,
        contextInsights: contextInsights,
        confidence: gpt4Results.overallConfidence,
        errors: gpt4Results.results.errors
      };

      // Add enhanced notes
      enhancedAnalysis.enhancedNotes = this.generateEnhancedNotes(
        enhancedScores,
        contextInsights,
        sentiment,
        flow
      );

      // Update metadata
      enhancedMetadata.gpt4Used = true;
      enhancedMetadata.gpt4Confidence = gpt4Results.overallConfidence;
      enhancedMetadata.analysisVersion = 'enhanced-v1.0';
    } else {
      // Fallback to traditional analysis
      enhancedAnalysis.gpt4Analysis = {
        error: gpt4Error || 'GPT-4 analysis not available',
        fallback: true
      };
      enhancedMetadata.gpt4Used = false;
      enhancedMetadata.analysisVersion = 'traditional-v1.0';
    }

    return {
      scores: enhancedScores,
      analysis: enhancedAnalysis,
      metadata: enhancedMetadata
    };
  }

  /**
   * Enhance a score with context insights from GPT-4
   * @param {number} baseScore - Base score from traditional analysis
   * @param {string} contextLevel - Context level from GPT-4 (low/medium/high)
   * @param {string} scoreType - Type of score being enhanced
   * @returns {number} Enhanced score
   */
  enhanceScoreWithContext(baseScore, contextLevel, scoreType) {
    const contextMultipliers = {
      low: 0.8,
      medium: 1.0,
      high: 1.2
    };

    const multiplier = contextMultipliers[contextLevel] || 1.0;
    const enhancedScore = Math.round(baseScore * multiplier);

    // Ensure score stays within 0-100 range
    return Math.max(0, Math.min(100, enhancedScore));
  }

  /**
   * Calculate enhanced overall score
   * @param {Object} scores - Individual scores
   * @returns {number} Enhanced overall score
   */
  calculateEnhancedOverallScore(scores) {
    const weights = this.baseScoringService.getWeights();
    
    const overall = 
      (scores.urgency * weights.urgency) +
      (scores.budget * weights.budget) +
      (scores.interest * weights.interest) +
      (scores.engagement * weights.engagement);

    return Math.round(overall);
  }

  /**
   * Generate enhanced analysis notes
   * @param {Object} scores - Enhanced scores
   * @param {Object} contextInsights - Context insights from GPT-4
   * @param {Object} sentiment - Sentiment analysis
   * @param {Object} flow - Conversation flow analysis
   * @returns {string} Enhanced analysis notes
   */
  generateEnhancedNotes(scores, contextInsights, sentiment, flow) {
    const notes = [];

    // Overall assessment
    if (scores.overall >= 85) {
      notes.push("לקוח בעל פוטנציאל גבוה מאוד לסגירת עסקה - ניתוח מתקדם מאשר את הפוטנציאל הגבוה");
    } else if (scores.overall >= 75) {
      notes.push("לקוח בעל פוטנציאל גבוה לסגירת עסקה - ניתוח מתקדם תומך בהערכה זו");
    } else if (scores.overall >= 60) {
      notes.push("לקוח בעל פוטנציאל טוב - ניתוח מתקדם מראה הזדמנויות לשיפור");
    } else if (scores.overall >= 45) {
      notes.push("לקוח עם פוטנציאל בינוני - ניתוח מתקדם מציע גישות חלופיות");
    } else {
      notes.push("לקוח עם פוטנציאל נמוך - ניתוח מתקדם מאשר את הצורך בגישה שונה");
    }

    // Context insights
    if (contextInsights) {
      if (contextInsights.deal_probability) {
        const probability = Math.round(contextInsights.deal_probability * 100);
        notes.push(`הסתברות לסגירת עסקה לפי ניתוח מתקדם: ${probability}%`);
      }

      if (contextInsights.recommended_next_steps) {
        const steps = contextInsights.recommended_next_steps.join(', ');
        notes.push(`צעדים מומלצים: ${steps}`);
      }
    }

    // Sentiment insights
    if (sentiment) {
      const overallSentiment = sentiment.overall_sentiment;
      const confidence = Math.round(sentiment.confidence * 100);
      
      if (overallSentiment === 'positive') {
        notes.push(`ניתוח רגשי חיובי (ביטחון: ${confidence}%) - סימן טוב לסגירת עסקה`);
      } else if (overallSentiment === 'negative') {
        notes.push(`ניתוח רגשי שלילי (ביטחון: ${confidence}%) - נדרש טיפול בהתנגדויות`);
      } else {
        notes.push(`ניתוח רגשי ניטרלי (ביטחון: ${confidence}%) - נדרש חיזוק העניין`);
      }
    }

    // Flow insights
    if (flow && flow.flow_quality) {
      const quality = flow.flow_quality;
      
      if (quality.smoothness === 'high') {
        notes.push("איכות שיחה גבוהה - זרימה חלקה ויעילה");
      } else if (quality.smoothness === 'low') {
        notes.push("איכות שיחה נמוכה - נדרש שיפור בזרימת השיחה");
      }

      if (quality.objections_handled) {
        notes.push("התנגדויות טופלו בהצלחה");
      } else {
        notes.push("התנגדויות לא טופלו כראוי - נדרש שיפור");
      }
    }

    return notes.join('. ') + '.';
  }

  /**
   * Get enhanced scoring weights
   * @returns {Object} Enhanced scoring weights
   */
  getEnhancedWeights() {
    return this.enhancedWeights;
  }

  /**
   * Update enhanced scoring weights
   * @param {Object} newWeights - New weights configuration
   */
  updateEnhancedWeights(newWeights) {
    this.enhancedWeights = { ...this.enhancedWeights, ...newWeights };
  }

  /**
   * Validate GPT-4 service connection
   * @returns {Promise<boolean>} Connection status
   */
  async validateGPT4Connection() {
    try {
      return await this.gpt4Service.validateConnection();
    } catch (error) {
      console.error('❌ GPT-4 connection validation failed:', error);
      return false;
    }
  }

  /**
   * Get analysis confidence level
   * @param {number} confidence - Confidence score
   * @returns {string} Confidence level
   */
  getConfidenceLevel(confidence) {
    if (confidence >= this.confidenceThresholds.high) {
      return 'high';
    } else if (confidence >= this.confidenceThresholds.medium) {
      return 'medium';
    } else if (confidence >= this.confidenceThresholds.low) {
      return 'low';
    } else {
      return 'very_low';
    }
  }

  /**
   * Compare traditional vs enhanced analysis
   * @param {Object} traditionalResults - Traditional analysis results
   * @param {Object} enhancedResults - Enhanced analysis results
   * @returns {Object} Comparison results
   */
  compareAnalysisResults(traditionalResults, enhancedResults) {
    const comparison = {
      overallScore: {
        traditional: traditionalResults.scores.overall,
        enhanced: enhancedResults.scores.overall,
        difference: enhancedResults.scores.overall - traditionalResults.scores.overall
      },
      individualScores: {},
      confidence: enhancedResults.metadata.gpt4Confidence || 0,
      improvements: []
    };

    // Compare individual scores
    ['urgency', 'budget', 'interest', 'engagement'].forEach(scoreType => {
      const traditional = traditionalResults.scores[scoreType];
      const enhanced = enhancedResults.scores[scoreType];
      
      comparison.individualScores[scoreType] = {
        traditional,
        enhanced,
        difference: enhanced - traditional
      };

      if (Math.abs(enhanced - traditional) > 10) {
        comparison.improvements.push(`${scoreType} score adjusted by ${enhanced - traditional} points`);
      }
    });

    return comparison;
  }
}

module.exports = new EnhancedScoringService();
