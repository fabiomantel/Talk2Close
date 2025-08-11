/**
 * WhisperService Tests - Audio Chunking Functionality
 */

const whisperService = require('../src/services/whisperService');

describe('WhisperService - Audio Chunking', () => {
  describe('combineTranscriptions', () => {
    test('should combine multiple transcriptions', () => {
      const transcriptions = [
        {
          text: 'Hello world',
          segments: [{ start: 0, end: 2, text: 'Hello' }]
        },
        {
          text: 'How are you',
          segments: [{ start: 0, end: 3, text: 'How' }]
        }
      ];

      const result = whisperService.combineTranscriptions(transcriptions, 10);
      
      expect(result.text).toBe('Hello world How are you');
      expect(result.segments).toHaveLength(2);
      expect(result.chunked).toBe(true);
      expect(result.numChunks).toBe(2);
    });

    test('should handle empty transcriptions array', () => {
      const result = whisperService.combineTranscriptions([], 10);
      
      expect(result.text).toBe('');
      expect(result.segments).toHaveLength(0);
      expect(result.chunked).toBe(true);
      expect(result.numChunks).toBe(0);
    });

    test('should handle single transcription', () => {
      const transcriptions = [
        {
          text: 'Single transcription',
          segments: [{ start: 0, end: 5, text: 'Single' }]
        }
      ];

      const result = whisperService.combineTranscriptions(transcriptions, 10);
      
      expect(result.text).toBe('Single transcription');
      expect(result.segments).toHaveLength(1);
      expect(result.chunked).toBe(true);
      expect(result.numChunks).toBe(1);
    });
  });

  describe('Method existence', () => {
    test('should have getAudioDuration method', () => {
      expect(typeof whisperService.getAudioDuration).toBe('function');
    });

    test('should have createAudioChunk method', () => {
      expect(typeof whisperService.createAudioChunk).toBe('function');
    });

    test('should have transcribeLargeFile method', () => {
      expect(typeof whisperService.transcribeLargeFile).toBe('function');
    });

    test('should have transcribeChunk method', () => {
      expect(typeof whisperService.transcribeChunk).toBe('function');
    });
  });

  describe('Configuration', () => {
    test('should have correct max file size limit', () => {
      expect(whisperService.maxFileSize).toBe(25 * 1024 * 1024); // 25MB for Whisper
    });

    test('should have chunk duration configuration', () => {
      expect(whisperService.chunkDuration).toBe(15 * 60); // 15 minutes
    });
  });
});
