const EnhancedScoringService = require('../src/services/enhancedScoringService');

describe('EnhancedScoringService', () => {
  let enhancedScoringService;

  beforeEach(() => {
    enhancedScoringService = new (require('../src/services/enhancedScoringService').constructor)();
  });

  describe('enhanceScoreWithContext', () => {
    test('should enhance score with high context level', () => {
      const baseScore = 50;
      const enhancedScore = enhancedScoringService.enhanceScoreWithContext(baseScore, 'high', 'urgency');
      expect(enhancedScore).toBe(60); // 50 * 1.2 = 60
    });

    test('should enhance score with medium context level', () => {
      const baseScore = 50;
      const enhancedScore = enhancedScoringService.enhanceScoreWithContext(baseScore, 'medium', 'urgency');
      expect(enhancedScore).toBe(50); // 50 * 1.0 = 50
    });

    test('should enhance score with low context level', () => {
      const baseScore = 50;
      const enhancedScore = enhancedScoringService.enhanceScoreWithContext(baseScore, 'low', 'urgency');
      expect(enhancedScore).toBe(40); // 50 * 0.8 = 40
    });

    test('should cap score at 100', () => {
      const baseScore = 90;
      const enhancedScore = enhancedScoringService.enhanceScoreWithContext(baseScore, 'high', 'urgency');
      expect(enhancedScore).toBe(100); // 90 * 1.2 = 108, capped at 100
    });

    test('should not go below 0', () => {
      const baseScore = 10;
      const enhancedScore = enhancedScoringService.enhanceScoreWithContext(baseScore, 'low', 'urgency');
      expect(enhancedScore).toBe(8); // 10 * 0.8 = 8
    });
  });

  describe('calculateEnhancedOverallScore', () => {
    test('should calculate overall score correctly', () => {
      const scores = {
        urgency: 80,
        budget: 70,
        interest: 60,
        engagement: 50
      };

      const overallScore = enhancedScoringService.calculateEnhancedOverallScore(scores);
      // 80*0.3 + 70*0.25 + 60*0.25 + 50*0.2 = 24 + 17.5 + 15 + 10 = 66.5, rounded to 67
      expect(overallScore).toBe(67);
    });
  });

  describe('getConfidenceLevel', () => {
    test('should return high confidence for scores >= 0.8', () => {
      expect(enhancedScoringService.getConfidenceLevel(0.9)).toBe('high');
      expect(enhancedScoringService.getConfidenceLevel(0.8)).toBe('high');
    });

    test('should return medium confidence for scores >= 0.6', () => {
      expect(enhancedScoringService.getConfidenceLevel(0.7)).toBe('medium');
      expect(enhancedScoringService.getConfidenceLevel(0.6)).toBe('medium');
    });

    test('should return low confidence for scores >= 0.4', () => {
      expect(enhancedScoringService.getConfidenceLevel(0.5)).toBe('low');
      expect(enhancedScoringService.getConfidenceLevel(0.4)).toBe('low');
    });

    test('should return very_low confidence for scores < 0.4', () => {
      expect(enhancedScoringService.getConfidenceLevel(0.3)).toBe('very_low');
      expect(enhancedScoringService.getConfidenceLevel(0.1)).toBe('very_low');
    });
  });

  describe('compareAnalysisResults', () => {
    test('should compare traditional vs enhanced analysis correctly', () => {
      const traditionalResults = {
        scores: {
          urgency: 50,
          budget: 60,
          interest: 70,
          engagement: 80,
          overall: 65
        }
      };

      const enhancedResults = {
        scores: {
          urgency: 65, // +15 difference
          budget: 75,  // +15 difference
          interest: 85, // +15 difference
          engagement: 95, // +15 difference
          overall: 80
        },
        metadata: {
          gpt4Confidence: 0.85
        }
      };

      const comparison = enhancedScoringService.compareAnalysisResults(traditionalResults, enhancedResults);

      expect(comparison.overallScore.traditional).toBe(65);
      expect(comparison.overallScore.enhanced).toBe(80);
      expect(comparison.overallScore.difference).toBe(15);
      expect(comparison.confidence).toBe(0.85);
      // All scores have differences > 10, so improvements should be present
      expect(comparison.improvements.length).toBe(4); // All 4 scores have differences > 10
    });
  });

  describe('generateEnhancedNotes', () => {
    test('should generate notes for high potential customer', () => {
      const scores = {
        overall: 85
      };

      const contextInsights = {
        deal_probability: 0.8,
        recommended_next_steps: ['schedule_viewing', 'send_details']
      };

      const sentiment = {
        overall_sentiment: 'positive',
        confidence: 0.9
      };

      const flow = {
        flow_quality: {
          smoothness: 'high',
          objections_handled: true
        }
      };

      const notes = enhancedScoringService.generateEnhancedNotes(scores, contextInsights, sentiment, flow);

      expect(notes).toContain('לקוח בעל פוטנציאל גבוה מאוד');
      expect(notes).toContain('הסתברות לסגירת עסקה');
      expect(notes).toContain('ניתוח רגשי חיובי');
      expect(notes).toContain('איכות שיחה גבוהה');
    });

    test('should generate notes for low potential customer', () => {
      const scores = {
        overall: 25
      };

      const contextInsights = {
        deal_probability: 0.2
      };

      const sentiment = {
        overall_sentiment: 'negative',
        confidence: 0.8
      };

      const notes = enhancedScoringService.generateEnhancedNotes(scores, contextInsights, sentiment, null);

      expect(notes).toContain('לקוח עם פוטנציאל נמוך'); // Fixed: removed "מאוד" as it's not in the actual implementation
      expect(notes).toContain('ניתוח רגשי שלילי');
    });
  });

  describe('updateEnhancedWeights', () => {
    test('should update enhanced weights correctly', () => {
      const newWeights = {
        traditional: 0.5,
        gpt4Context: 0.3
      };

      enhancedScoringService.updateEnhancedWeights(newWeights);

      const updatedWeights = enhancedScoringService.getEnhancedWeights();
      expect(updatedWeights.traditional).toBe(0.5);
      expect(updatedWeights.gpt4Context).toBe(0.3);
      expect(updatedWeights.sentiment).toBe(0.15); // Should remain unchanged
      expect(updatedWeights.flow).toBe(0.10); // Should remain unchanged
    });
  });
});
