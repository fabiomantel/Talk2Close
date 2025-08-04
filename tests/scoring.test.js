/**
 * Tests for Scoring Service
 * Tests Hebrew text analysis and scoring algorithm
 */

const scoringService = require('../src/services/scoringService');

describe('Scoring Service', () => {
  describe('Hebrew Text Analysis', () => {
    test('should analyze Hebrew transcript with urgency indicators', () => {
      const transcript = 'שלום, אני צריך לעבור עד החודש הבא כי השכירות שלי נגמרת. זה דחוף מאוד.';
      
      const result = scoringService.analyzeTranscript(transcript, 120, 20);
      
      expect(result.scores.urgency).toBeGreaterThan(50);
      expect(result.scores.overall).toBeGreaterThan(0);
      expect(result.analysis.keyPhrases.urgency.length).toBeGreaterThan(0);
    });

    test('should analyze Hebrew transcript with budget indicators', () => {
      const transcript = 'התקציב שלי הוא 800 אלף שקל. יש לי משכנתא מאושרת ל-70%.';
      
      const result = scoringService.analyzeTranscript(transcript, 90, 15);
      
      expect(result.scores.budget).toBeGreaterThan(50);
      expect(result.analysis.keyPhrases.budget.length).toBeGreaterThan(0);
    });

    test('should analyze Hebrew transcript with interest indicators', () => {
      const transcript = 'זה בדיוק מה שחיפשתי! אני אוהב את המיקום. מתי אפשר לראות את הנכס?';
      
      const result = scoringService.analyzeTranscript(transcript, 180, 25);
      
      expect(result.scores.interest).toBeGreaterThan(50);
      expect(result.analysis.keyPhrases.interest.length).toBeGreaterThan(0);
    });

    test('should analyze Hebrew transcript with engagement indicators', () => {
      const transcript = 'תשלח לי פרטים נוספים. אני רוצה לשמוע עוד על הנכס. תוכל להסביר יותר?';
      
      const result = scoringService.analyzeTranscript(transcript, 240, 30);
      
      expect(result.scores.engagement).toBeGreaterThan(50);
      expect(result.analysis.keyPhrases.engagement.length).toBeGreaterThan(0);
    });

    test('should detect objection phrases', () => {
      const transcript = 'זה יקר מדי. אני צריך לחשוב על זה. אני אחזור אליך.';
      
      const result = scoringService.analyzeTranscript(transcript, 60, 12);
      
      expect(result.analysis.objections.length).toBeGreaterThan(0);
      expect(result.scores.overall).toBeLessThan(50); // Lower score due to objections
    });

    test('should calculate overall score correctly', () => {
      const transcript = 'אני צריך לעבור עד החודש הבא. התקציב שלי הוא 800 אלף. אני אוהב את המיקום. תשלח לי פרטים נוספים.';
      
      const result = scoringService.analyzeTranscript(transcript, 300, 40);
      
      // Calculate expected overall score
      const expectedOverall = Math.round(
        (result.scores.urgency * 0.30) +
        (result.scores.budget * 0.25) +
        (result.scores.interest * 0.25) +
        (result.scores.engagement * 0.20)
      );
      
      expect(result.scores.overall).toBe(expectedOverall);
    });

    test('should handle empty transcript', () => {
      expect(() => {
        scoringService.analyzeTranscript('', 0, 0);
      }).toThrow('Transcript is required for analysis');
    });

    test('should normalize Hebrew text correctly', () => {
      const text = '  שלום   עולם!  ';
      const normalized = scoringService.normalizeHebrewText(text);
      
      expect(normalized).toBe('שלום עולם');
    });

    test('should generate analysis notes', () => {
      const transcript = 'אני צריך לעבור עד החודש הבא. התקציב שלי הוא 800 אלף.';
      
      const result = scoringService.analyzeTranscript(transcript, 120, 20);
      
      expect(result.analysis.notes).toBeTruthy();
      expect(typeof result.analysis.notes).toBe('string');
      expect(result.analysis.notes.length).toBeGreaterThan(0);
    });

    test('should calculate confidence level', () => {
      const shortTranscript = 'שלום';
      const longTranscript = 'שלום, אני מעוניין בנכס. התקציב שלי הוא 800 אלף שקל. אני אוהב את המיקום. תשלח לי פרטים נוספים. אני רוצה לראות את הנכס.';
      
      const shortResult = scoringService.analyzeTranscript(shortTranscript, 30, 2);
      const longResult = scoringService.analyzeTranscript(longTranscript, 300, 50);
      
      expect(longResult.analysis.confidence).toBeGreaterThan(shortResult.analysis.confidence);
    });
  });

  describe('Scoring Weights', () => {
    test('should return correct scoring weights', () => {
      const weights = scoringService.getWeights();
      
      expect(weights.urgency).toBe(0.30);
      expect(weights.budget).toBe(0.25);
      expect(weights.interest).toBe(0.25);
      expect(weights.engagement).toBe(0.20);
      
      // Total should equal 1.0
      const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      expect(total).toBe(1.0);
    });
  });

  describe('Hebrew Phrases', () => {
    test('should return Hebrew phrases by category', () => {
      const phrases = scoringService.getPhrases();
      
      expect(phrases.urgency).toBeDefined();
      expect(phrases.budget).toBeDefined();
      expect(phrases.interest).toBeDefined();
      expect(phrases.engagement).toBeDefined();
      
      expect(phrases.urgency.high.length).toBeGreaterThan(0);
      expect(phrases.urgency.medium.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long transcripts', () => {
      const longTranscript = 'שלום '.repeat(1000); // Very long transcript
      
      const result = scoringService.analyzeTranscript(longTranscript, 600, 1000);
      
      expect(result.scores.overall).toBeGreaterThanOrEqual(0);
      expect(result.scores.overall).toBeLessThanOrEqual(100);
    });

    test('should handle transcripts with only English', () => {
      const englishTranscript = 'Hello, I am interested in the property. My budget is 800k.';
      
      const result = scoringService.analyzeTranscript(englishTranscript, 120, 20);
      
      // Should still return valid scores (though likely low due to no Hebrew phrases)
      expect(result.scores.overall).toBeGreaterThanOrEqual(0);
      expect(result.scores.overall).toBeLessThanOrEqual(100);
    });

    test('should handle transcripts with mixed Hebrew and English', () => {
      const mixedTranscript = 'שלום, I am interested in the property. התקציב שלי הוא 800 אלף.';
      
      const result = scoringService.analyzeTranscript(mixedTranscript, 180, 30);
      
      expect(result.scores.budget).toBeGreaterThan(0);
      expect(result.analysis.keyPhrases.budget.length).toBeGreaterThan(0);
    });
  });
}); 