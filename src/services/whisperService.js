const OpenAI = require('openai');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

class WhisperService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.maxFileSize = 25 * 1024 * 1024; // 25MB Whisper limit
    this.chunkDuration = 15 * 60; // 15 minutes per chunk
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
      console.log(`🔍 Checking if file exists: ${filePath}`);
      if (!await fs.pathExists(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        throw new Error(`Audio file not found: ${filePath}`);
      }
      console.log(`✅ File exists`);

      // Get file stats for logging
      console.log(`📊 Getting file statistics...`);
      const stats = await fs.stat(filePath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📁 File size: ${fileSizeInMB} MB (${stats.size} bytes)`);
      console.log(`📅 File created: ${stats.birthtime}`);
      console.log(`📅 File modified: ${stats.mtime}`);

      // Check if file needs chunking
      if (stats.size > this.maxFileSize) {
        console.log(`📦 File exceeds 25MB limit (${this.maxFileSize} bytes), splitting into chunks...`);
        return await this.transcribeLargeFile(filePath);
      }
      console.log(`✅ File size is within limits`);

      // Create file stream
      console.log(`📂 Creating file stream...`);
      const audioFile = fs.createReadStream(filePath);

      // Call Whisper API with Hebrew language specification
      console.log(`🤖 Calling OpenAI Whisper API...`);
      console.log(`🔧 API parameters:`, {
        model: "whisper-1",
        language: "he",
        response_format: "verbose_json",
        timestamp_granularities: ["word"]
      });
      
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
      console.log(`🌐 Language: ${transcription.language}`);
      console.log(`📊 Segments count: ${transcription.segments?.length || 0}`);
      console.log(`📝 Text preview: "${transcription.text.substring(0, 100)}..."`);

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
   * Transcribe large audio file by splitting into chunks
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<Object>} - Combined transcription result
   */
  async transcribeLargeFile(filePath) {
    try {
      console.log(`🔧 Processing large file with chunking...`);
      
      // Get audio duration
      const duration = await this.getAudioDuration(filePath);
      console.log(`⏱️ Total duration: ${duration} seconds`);

      // Calculate number of chunks needed
      const numChunks = Math.ceil(duration / this.chunkDuration);
      console.log(`📦 Splitting into ${numChunks} chunks of ${this.chunkDuration} seconds each`);

      // Create temporary directory for chunks
      const tempDir = path.join(path.dirname(filePath), 'temp_chunks');
      await fs.ensureDir(tempDir);

      const chunks = [];
      const transcriptions = [];

      try {
        // Split audio into chunks
        for (let i = 0; i < numChunks; i++) {
          const startTime = i * this.chunkDuration;
          const endTime = Math.min((i + 1) * this.chunkDuration, duration);
          const chunkPath = path.join(tempDir, `chunk_${i + 1}.mp3`);
          
          console.log(`🎵 Creating chunk ${i + 1}/${numChunks} (${startTime}s - ${endTime}s)`);
          
          await this.createAudioChunk(filePath, chunkPath, startTime, endTime - startTime);
          chunks.push(chunkPath);
        }

        // Transcribe each chunk
        for (let i = 0; i < chunks.length; i++) {
          console.log(`🎤 Transcribing chunk ${i + 1}/${chunks.length}`);
          
          const chunkTranscription = await this.transcribeChunk(chunks[i], i * this.chunkDuration);
          transcriptions.push(chunkTranscription);
        }

        // Combine transcriptions
        const combinedTranscription = this.combineTranscriptions(transcriptions, duration);
        
        console.log(`✅ Large file transcription completed successfully`);
        console.log(`📝 Combined text length: ${combinedTranscription.text.length} characters`);
        
        return combinedTranscription;

      } finally {
        // Clean up temporary chunks
        console.log(`🧹 Cleaning up temporary chunks...`);
        await fs.remove(tempDir).catch(err => {
          console.warn('Warning: Could not clean up temporary chunks:', err);
        });
      }

    } catch (error) {
      console.error('❌ Large file transcription failed:', error);
      throw new Error(`Large file transcription failed: ${error.message}`);
    }
  }

  /**
   * Get audio file duration using ffmpeg
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<number>} - Duration in seconds
   */
  getAudioDuration(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error(`Failed to get audio duration: ${err.message}`));
        } else {
          resolve(metadata.format.duration);
        }
      });
    });
  }

  /**
   * Create audio chunk using ffmpeg
   * @param {string} inputPath - Input audio file path
   * @param {string} outputPath - Output chunk file path
   * @param {number} startTime - Start time in seconds
   * @param {number} duration - Duration in seconds
   * @returns {Promise<void>}
   */
  createAudioChunk(inputPath, outputPath, startTime, duration) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .outputOptions(['-c:a', 'mp3', '-b:a', '128k'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
        .run();
    });
  }

  /**
   * Transcribe a single audio chunk
   * @param {string} chunkPath - Path to the audio chunk
   * @param {number} timeOffset - Time offset for this chunk
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribeChunk(chunkPath, timeOffset) {
    const audioFile = fs.createReadStream(chunkPath);
    
    const transcription = await this.openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "he",
      response_format: "verbose_json",
      timestamp_granularities: ["word"]
    });

    // Adjust timestamps to account for chunk offset
    if (transcription.segments) {
      transcription.segments = transcription.segments.map(segment => ({
        ...segment,
        start: segment.start + timeOffset,
        end: segment.end + timeOffset
      }));
    }

    return transcription;
  }

  /**
   * Combine multiple transcription results
   * @param {Array} transcriptions - Array of transcription results
   * @param {number} totalDuration - Total audio duration
   * @returns {Object} - Combined transcription result
   */
  combineTranscriptions(transcriptions, totalDuration) {
    const combinedText = transcriptions.map(t => t.text).join(' ');
    const combinedSegments = transcriptions.flatMap(t => t.segments || []);
    
    return {
      success: true,
      text: combinedText,
      language: 'he',
      duration: totalDuration,
      segments: combinedSegments,
      timestamp: new Date().toISOString(),
      chunked: true,
      numChunks: transcriptions.length
    };
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

      // Check file size (increased limit for chunking support)
      const stats = await fs.stat(filePath);
      const maxSize = 500 * 1024 * 1024; // 500MB (increased from 25MB)
      
      if (stats.size > maxSize) {
        throw new Error(`File size (${(stats.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (500MB)`);
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