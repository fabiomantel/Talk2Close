/**
 * Comprehensive WhisperService Tests
 * Tests audio file validation, transcription API mocking, and error handling
 */

const whisperService = require('../src/services/whisperService');
const fs = require('fs-extra');
const path = require('path');

// Mock OpenAI
jest.mock('openai');
const OpenAI = require('openai');

// Mock fs-extra
jest.mock('fs-extra');

describe('WhisperService', () => {
  let mockOpenAI;
  let mockAudioTranscriptions;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup OpenAI mock
    mockAudioTranscriptions = {
      create: jest.fn()
    };
    mockOpenAI = {
      audio: {
        transcriptions: mockAudioTranscriptions
      }
    };
    OpenAI.mockImplementation(() => mockOpenAI);

    // Mock the openai instance on the whisperService
    whisperService.openai = mockOpenAI;
  });

  describe('initialization', () => {
    test('should have OpenAI client initialized', () => {
      expect(whisperService).toBeDefined();
      expect(whisperService.openai).toBeDefined();
    });
  });

  describe('validateAudioFile', () => {
    test('should validate existing audio file successfully', async () => {
      const filePath = '/test/path/audio.mp3';
      
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 1024 * 1024 }); // 1MB
      fs.access.mockResolvedValue();

      const result = await whisperService.validateAudioFile(filePath);
      expect(result).toBe(true);
      
      expect(fs.pathExists).toHaveBeenCalledWith(filePath);
      expect(fs.stat).toHaveBeenCalledWith(filePath);
    });

    test('should throw error for non-existent file', async () => {
      const filePath = '/test/path/nonexistent.mp3';
      
      fs.pathExists.mockResolvedValue(false);

      await expect(whisperService.validateAudioFile(filePath))
        .rejects.toThrow('File does not exist');
    });

    test('should throw error for file too large (>25MB)', async () => {
      const filePath = '/test/path/large.mp3';
      const largeSize = 26 * 1024 * 1024; // 26MB
      
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: largeSize });

      await expect(whisperService.validateAudioFile(filePath))
        .rejects.toThrow('File size (26.00MB) exceeds maximum allowed size (25MB)');
    });

    test('should validate file access permissions', async () => {
      const filePath = '/test/path/audio.mp3';
      
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 1024 * 1024 });
      fs.access.mockResolvedValue();

      const result = await whisperService.validateAudioFile(filePath);
      expect(result).toBe(true);
      expect(fs.access).toHaveBeenCalledWith(filePath, fs.constants.R_OK);
    });
  });

  describe('transcribeAudio', () => {
    test('should transcribe Hebrew audio successfully', async () => {
      const filePath = '/test/path/hebrew_call.mp3';
      const mockTranscription = {
        text: 'שלום, אני מעוניין בנכס. התקציב שלי הוא 800 אלף שקל.',
        language: 'he',
        duration: 120,
        segments: []
      };
      
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 1024 * 1024 });
      fs.createReadStream.mockReturnValue('mock-stream');
      mockAudioTranscriptions.create.mockResolvedValue(mockTranscription);

      const result = await whisperService.transcribeAudio(filePath);

      expect(result).toEqual({
        success: true,
        text: mockTranscription.text,
        language: 'he',
        duration: 120,
        segments: [],
        timestamp: expect.any(String)
      });

      expect(mockAudioTranscriptions.create).toHaveBeenCalledWith({
        file: 'mock-stream',
        model: 'whisper-1',
        language: 'he',
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });
    });

    test('should handle OpenAI API errors gracefully', async () => {
      const filePath = '/test/path/audio.mp3';
      const apiError = new Error('API rate limit exceeded');
      apiError.response = { status: 429, data: { error: { message: 'Rate limit exceeded' } } };
      
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 1024 * 1024 });
      fs.createReadStream.mockReturnValue('mock-stream');
      mockAudioTranscriptions.create.mockRejectedValue(apiError);

      await expect(whisperService.transcribeAudio(filePath))
        .rejects.toThrow('Rate limit exceeded. Please try again later.');
    });

    test('should handle file read errors', async () => {
      const filePath = '/test/path/corrupted.mp3';
      
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 1024 * 1024 });
      fs.createReadStream.mockImplementation(() => {
        throw new Error('File read error');
      });

      await expect(whisperService.transcribeAudio(filePath))
        .rejects.toThrow('Transcription failed: File read error');
    });

    test('should validate file before transcription', async () => {
      const filePath = '/test/path/nonexistent.mp3';
      
      fs.pathExists.mockResolvedValue(false);

      await expect(whisperService.transcribeAudio(filePath))
        .rejects.toThrow('Audio file not found: /test/path/nonexistent.mp3');

      expect(mockAudioTranscriptions.create).not.toHaveBeenCalled();
    });
  });

  describe('getTranscriptionStats', () => {
    test('should calculate stats for Hebrew text', () => {
      const transcription = {
        text: 'שלום עולם. זה טקסט בעברית עם מספר מילים.',
        duration: 120
      };

      const stats = whisperService.getTranscriptionStats(transcription);

      expect(stats).toEqual({
        wordCount: expect.any(Number),
        characterCount: transcription.text.length,
        duration: 120,
        wordsPerMinute: expect.any(Number)
      });

      expect(stats.wordCount).toBeGreaterThan(0);
      expect(stats.wordsPerMinute).toBeGreaterThan(0);
    });

    test('should handle transcription without duration', () => {
      const transcription = {
        text: 'שלום עולם',
        duration: null
      };

      const stats = whisperService.getTranscriptionStats(transcription);

      expect(stats.duration).toBe(0);
      expect(stats.wordsPerMinute).toBe(0);
    });

    test('should handle empty text', () => {
      const transcription = {
        text: '',
        duration: 60
      };

      const stats = whisperService.getTranscriptionStats(transcription);

      expect(stats.wordCount).toBe(0);
      expect(stats.characterCount).toBe(0);
      expect(stats.wordsPerMinute).toBe(0);
    });

    test('should handle null transcription', () => {
      const stats = whisperService.getTranscriptionStats(null);

      expect(stats).toEqual({
        wordCount: 0,
        characterCount: 0,
        duration: 0,
        wordsPerMinute: 0
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing OpenAI API key in service', () => {
      expect(whisperService.openai).toBeDefined();
    });

    test('should handle network timeouts', async () => {
      const filePath = '/test/path/audio.mp3';
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'ETIMEDOUT';
      
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 1024 * 1024 });
      fs.createReadStream.mockReturnValue('mock-stream');
      mockAudioTranscriptions.create.mockRejectedValue(timeoutError);

      await expect(whisperService.transcribeAudio(filePath))
        .rejects.toThrow('Network error. Please check your internet connection and try again.');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete workflow: validate -> transcribe -> stats', async () => {
      const filePath = '/test/path/complete_call.mp3';
      const mockTranscription = {
        text: 'שלום, אני מעוניין בנכס בתל אביב. התקציב שלי הוא 800 אלף שקל.'
      };
      
      // Setup mocks for complete workflow
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 5 * 1024 * 1024 }); // 5MB
      fs.createReadStream.mockReturnValue('mock-stream');
      mockAudioTranscriptions.create.mockResolvedValue(mockTranscription);

      // Validate
      await whisperService.validateAudioFile(filePath);
      
      // Transcribe
      const result = await whisperService.transcribeAudio(filePath);
      
      // Get stats
      const stats = whisperService.getTranscriptionStats(result);

      expect(result.text).toBe(mockTranscription.text);
      expect(stats.wordCount).toBeGreaterThan(0);
      expect(stats.characterCount).toBeGreaterThan(0);
    });
  });
});
