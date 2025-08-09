const ScoringService = require('../src/services/scoringService');

describe('ScoringService - Hebrew Analysis Insights', () => {
  let scoringService;

  beforeEach(() => {
    scoringService = new (require('../src/services/scoringService').constructor)();
  });

  describe('generateAnalysisNotes', () => {
    test('should generate different insights for different scores', () => {
      // High potential customer
      const highPotentialData = {
        overallScore: 85,
        urgencyScore: 80,
        budgetScore: 75,
        interestScore: 90,
        engagementScore: 85,
        objections: [],
        duration: 180,
        wordCount: 150
      };

      const highNotes = scoringService.generateAnalysisNotes(highPotentialData);
      expect(highNotes).toContain('לקוח בעל פוטנציאל גבוה');

      // Low potential customer
      const lowPotentialData = {
        overallScore: 25,
        urgencyScore: 30,
        budgetScore: 20,
        interestScore: 35,
        engagementScore: 15,
        objections: ['זה יקר מדי'],
        duration: 45,
        wordCount: 30
      };

      const lowNotes = scoringService.generateAnalysisNotes(lowPotentialData);
      expect(lowNotes).toContain('לקוח עם פוטנציאל נמוך');
      expect(lowNotes).toContain('זוהתה התנגדות');
    });
  });
}); 