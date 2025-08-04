const OpenAI = require('openai');
const fs = require('fs-extra');

class WhisperService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Transcribe audio file to Hebrew text using OpenAI Whisper API
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribeAudio(filePath) {
    try {
      console.log(`🎤 Starting transcription for: ${filePath}`);

      // Check if file exists
      if (!await fs.pathExists(filePath)) {
        throw new Error(`Audio file not found: ${filePath}`);
      }

      // Get file stats for logging
      const stats = await fs.stat(filePath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📁 File size: ${fileSizeInMB} MB`);

      // Create file stream
      const audioFile = fs.createReadStream(filePath);

      // Call Whisper API with Hebrew language specification
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "he", // Hebrew language
        response_format: "verbose_json",
        timestamp_granularities: ["word"]
      });

      console.log(`✅ Transcription completed successfully`);
      console.log(`📝 Text length: ${transcription.text.length} characters`);
      console.log(`⏱️ Duration: ${transcription.duration} seconds`);

      return {
        success: true,
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments || [],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Whisper API error:', error);
      
      // Handle specific OpenAI errors
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            throw new Error('Invalid OpenAI API key. Please check your configuration.');
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.');
          case 413:
            throw new Error('Audio file too large. Maximum size is 25MB.');
          default:
            throw new Error(`OpenAI API error: ${data?.error?.message || 'Unknown error'}`);
        }
      }

      // Handle file system errors
      if (error.code === 'ENOENT') {
        throw new Error('Audio file not found or inaccessible.');
      }

      // Handle network errors
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }

      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Validate audio file before transcription
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<boolean>} - Validation result
   */
  async validateAudioFile(filePath) {
    try {
      // Check if file exists
      if (!await fs.pathExists(filePath)) {
        throw new Error('File does not exist');
      }

      // Check file size (Whisper limit is 25MB)
      const stats = await fs.stat(filePath);
      const maxSize = 25 * 1024 * 1024; // 25MB
      
      if (stats.size > maxSize) {
        throw new Error(`File size (${(stats.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (25MB)`);
      }

      // Check if file is readable
      await fs.access(filePath, fs.constants.R_OK);
      
      return true;
    } catch (error) {
      console.error('❌ Audio file validation failed:', error);
      throw error;
    }
  }

  /**
   * Get transcription statistics
   * @param {Object} transcription - Transcription result
   * @returns {Object} - Statistics
   */
  getTranscriptionStats(transcription) {
    if (!transcription || !transcription.text) {
      return {
        wordCount: 0,
        characterCount: 0,
        duration: 0,
        wordsPerMinute: 0
      };
    }

    const wordCount = transcription.text.split(/\s+/).length;
    const characterCount = transcription.text.length;
    const duration = transcription.duration || 0;
    const wordsPerMinute = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;

    return {
      wordCount,
      characterCount,
      duration,
      wordsPerMinute
    };
  }
}

module.exports = new WhisperService(); 