/**
 * GPT-4 Analysis Service for Enhanced Hebrew Sales Call Analysis
 * Provides context-aware analysis using OpenAI GPT-4 API
 */

const OpenAI = require('openai');

class GPT4AnalysisService {
  constructor() {
    // Initialize OpenAI client only if API key is available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.isAvailable = true;
    } else {
      this.isAvailable = false;
      console.warn('⚠️ OpenAI API key not configured. GPT-4 analysis will not be available.');
    }

    // Analysis prompts for Hebrew sales calls
    this.prompts = {
      contextAnalysis: `
        Analyze this Hebrew sales call transcript and provide a detailed analysis in JSON format with the following structure:
        
        {
          "sentiment": {
            "overall": "positive|negative|neutral",
            "confidence": 0.85,
            "changes": [
              {"phase": "introduction", "sentiment": "neutral", "confidence": 0.8},
              {"phase": "needs_assessment", "sentiment": "positive", "confidence": 0.9}
            ]
          },
          "conversation_phases": [
            {
              "phase": "introduction",
              "start_time": 0,
              "end_time": 30,
              "confidence": 0.9,
              "key_points": ["greeting", "purpose_statement"]
            }
          ],
          "speaker_analysis": {
            "customer_speech_percentage": 65,
            "agent_speech_percentage": 35,
            "customer_engagement_level": "high|medium|low",
            "key_customer_phrases": ["אני מעוניין", "מה המחיר"]
          },
          "objections": [
            {
              "type": "price|timing|location|other",
              "strength": "low|medium|high",
              "phrase": "זה יקר מדי",
              "context": "Customer expressing price concern",
              "confidence": 0.9
            }
          ],
          "buying_signals": [
            {
              "type": "urgency|budget|interest|engagement",
              "strength": "low|medium|high",
              "phrase": "אני צריך לעבור עד החודש הבא",
              "confidence": 0.95
            }
          ],
          "context_insights": {
            "urgency_level": "low|medium|high",
            "budget_clarity": "low|medium|high",
            "interest_level": "low|medium|high",
            "engagement_level": "low|medium|high",
            "deal_probability": 0.75,
            "recommended_next_steps": ["schedule_viewing", "send_details"]
          }
        }
        
        Focus on Hebrew language nuances and Israeli real estate market context. Provide confidence scores for all assessments.
        
        Transcript: {transcript}
      `,

      sentimentAnalysis: `
        Analyze the emotional tone and sentiment of this Hebrew conversation. Provide analysis in JSON format:
        
        {
          "overall_sentiment": "positive|negative|neutral",
          "confidence": 0.85,
          "sentiment_breakdown": {
            "positive_indicators": ["enthusiasm", "interest", "agreement"],
            "negative_indicators": ["frustration", "doubt", "objections"],
            "neutral_indicators": ["information_seeking", "clarification"]
          },
          "emotional_triggers": [
            {
              "trigger": "price_mention",
              "sentiment_change": "negative",
              "intensity": "medium"
            }
          ],
          "cultural_context": {
            "israeli_business_style": true,
            "direct_communication": true,
            "relationship_focused": false
          }
        }
        
        Consider Hebrew cultural context and business communication patterns.
        
        Transcript: {transcript}
      `,

      conversationFlow: `
        Analyze the conversation flow and structure of this Hebrew sales call. Provide analysis in JSON format:
        
        {
          "phases": [
            {
              "name": "introduction|needs_assessment|presentation|objection_handling|closing",
              "start_time": 0,
              "end_time": 60,
              "duration_seconds": 60,
              "key_activities": ["greeting", "purpose_explanation"],
              "effectiveness": "high|medium|low",
              "customer_response": "positive|neutral|negative"
            }
          ],
          "key_moments": [
            {
              "timestamp": 120,
              "type": "objection|buying_signal|closing_attempt",
              "description": "Customer expresses price concern",
              "impact": "positive|negative|neutral"
            }
          ],
          "flow_quality": {
            "smoothness": "high|medium|low",
            "engagement_maintained": true,
            "objections_handled": true,
            "closing_attempts": 2
          }
        }
        
        Focus on sales conversation structure and effectiveness.
        
        Transcript: {transcript}
      `
    };
  }

  /**
   * Check if GPT-4 service is available
   * @returns {boolean} Service availability
   */
  isServiceAvailable() {
    return this.isAvailable;
  }

  /**
   * Perform comprehensive context analysis using GPT-4
   * @param {string} transcript - Hebrew transcript text
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeContext(transcript, options = {}) {
    if (!this.isAvailable) {
      throw new Error('GPT-4 service is not available. Please configure OPENAI_API_KEY.');
    }

    try {
      console.log('🤖 Starting GPT-4 context analysis...');
      
      const prompt = this.prompts.contextAnalysis.replace('{transcript}', transcript);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert Hebrew sales call analyst specializing in real estate. Provide detailed, accurate analysis in JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      console.log('✅ GPT-4 context analysis completed');
      
      return {
        success: true,
        analysis,
        metadata: {
          model: "gpt-4",
          tokens_used: response.usage.total_tokens,
          analysis_timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ GPT-4 context analysis failed:', error);
      throw new Error(`GPT-4 analysis failed: ${error.message}`);
    }
  }

  /**
   * Perform sentiment analysis using GPT-4
   * @param {string} transcript - Hebrew transcript text
   * @returns {Promise<Object>} Sentiment analysis results
   */
  async analyzeSentiment(transcript) {
    if (!this.isAvailable) {
      throw new Error('GPT-4 service is not available. Please configure OPENAI_API_KEY.');
    }

    try {
      console.log('😊 Starting GPT-4 sentiment analysis...');
      
      const prompt = this.prompts.sentimentAnalysis.replace('{transcript}', transcript);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in Hebrew sentiment analysis. Analyze emotional tone and provide results in JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const sentiment = JSON.parse(response.choices[0].message.content);
      
      console.log('✅ GPT-4 sentiment analysis completed');
      
      return {
        success: true,
        sentiment,
        metadata: {
          model: "gpt-4",
          tokens_used: response.usage.total_tokens,
          analysis_timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ GPT-4 sentiment analysis failed:', error);
      throw new Error(`Sentiment analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze conversation flow and structure
   * @param {string} transcript - Hebrew transcript text
   * @returns {Promise<Object>} Conversation flow analysis
   */
  async analyzeConversationFlow(transcript) {
    if (!this.isAvailable) {
      throw new Error('GPT-4 service is not available. Please configure OPENAI_API_KEY.');
    }

    try {
      console.log('🔄 Starting GPT-4 conversation flow analysis...');
      
      const prompt = this.prompts.conversationFlow.replace('{transcript}', transcript);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in sales conversation analysis. Analyze conversation structure and provide results in JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      const flow = JSON.parse(response.choices[0].message.content);
      
      console.log('✅ GPT-4 conversation flow analysis completed');
      
      return {
        success: true,
        flow,
        metadata: {
          model: "gpt-4",
          tokens_used: response.usage.total_tokens,
          analysis_timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ GPT-4 conversation flow analysis failed:', error);
      throw new Error(`Conversation flow analysis failed: ${error.message}`);
    }
  }

  /**
   * Perform comprehensive analysis combining all aspects
   * @param {string} transcript - Hebrew transcript text
   * @returns {Promise<Object>} Comprehensive analysis results
   */
  async performComprehensiveAnalysis(transcript) {
    if (!this.isAvailable) {
      throw new Error('GPT-4 service is not available. Please configure OPENAI_API_KEY.');
    }

    try {
      console.log('🚀 Starting comprehensive GPT-4 analysis...');
      
      // Perform all analyses in parallel for efficiency
      const [contextResult, sentimentResult, flowResult] = await Promise.allSettled([
        this.analyzeContext(transcript),
        this.analyzeSentiment(transcript),
        this.analyzeConversationFlow(transcript)
      ]);

      const results = {
        context: contextResult.status === 'fulfilled' ? contextResult.value : null,
        sentiment: sentimentResult.status === 'fulfilled' ? sentimentResult.value : null,
        flow: flowResult.status === 'fulfilled' ? flowResult.value : null,
        errors: []
      };

      // Collect any errors
      if (contextResult.status === 'rejected') {
        results.errors.push(`Context analysis: ${contextResult.reason.message}`);
      }
      if (sentimentResult.status === 'rejected') {
        results.errors.push(`Sentiment analysis: ${sentimentResult.reason.message}`);
      }
      if (flowResult.status === 'rejected') {
        results.errors.push(`Flow analysis: ${flowResult.reason.message}`);
      }

      // Calculate overall confidence
      const confidences = [];
      if (results.context?.analysis?.sentiment?.confidence) {
        confidences.push(results.context.analysis.sentiment.confidence);
      }
      if (results.sentiment?.sentiment?.confidence) {
        confidences.push(results.sentiment.sentiment.confidence);
      }
      
      const overallConfidence = confidences.length > 0 
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
        : 0.5;

      console.log('✅ Comprehensive GPT-4 analysis completed');
      
      return {
        success: results.errors.length === 0,
        results,
        overallConfidence,
        metadata: {
          analysis_timestamp: new Date().toISOString(),
          total_errors: results.errors.length
        }
      };

    } catch (error) {
      console.error('❌ Comprehensive GPT-4 analysis failed:', error);
      throw new Error(`Comprehensive analysis failed: ${error.message}`);
    }
  }

  /**
   * Validate GPT-4 API connection
   * @returns {Promise<boolean>} Connection status
   */
  async validateConnection() {
    if (!this.isAvailable) {
      return false;
    }

    try {
      const response = await this.openai.models.list();
      return response.data.length > 0;
    } catch (error) {
      console.error('❌ GPT-4 API connection validation failed:', error);
      return false;
    }
  }

  /**
   * Get API usage statistics
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats() {
    if (!this.isAvailable) {
      return {
        success: false,
        error: 'GPT-4 service is not available'
      };
    }

    try {
      // Note: OpenAI doesn't provide usage stats via API for GPT-4
      // This would need to be tracked manually in production
      return {
        success: true,
        message: 'Usage tracking not available via API',
        recommendation: 'Implement manual usage tracking for cost monitoring'
      };
    } catch (error) {
      console.error('❌ Failed to get usage stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new GPT4AnalysisService();
