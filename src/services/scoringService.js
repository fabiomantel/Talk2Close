/**
 * Hebrew Sales Call Scoring Service
 * Implements the scoring algorithm for analyzing Hebrew sales call transcripts
 */

class ScoringService {
  constructor() {
    // Scoring weights as defined in SYSTEM_DESIGN.md
    this.weights = {
      urgency: 0.30,    // 30%
      budget: 0.25,     // 25%
      interest: 0.25,   // 25%
      engagement: 0.20  // 20%
    };

    // Hebrew phrases for scoring (from SYSTEM_DESIGN.md)
    this.hebrewPhrases = {
      urgency: {
        high: [
          'אני צריך לעבור עד החודש הבא',
          'זה דחוף מאוד',
          'השכירות שלי נגמרת בעוד חודש',
          'האישה דוחפת לקנות',
          'יש לי דדליין',
          'דחוף',
          'צריך מהר',
          'יש לי לחץ זמן',
          'המשפחה דוחפת',
          'זמן קצר',
          'מהר',
          'דחיפות'
        ],
        medium: [
          'אני רוצה לעבור',
          'השכירות נגמרת',
          'אני מחפש',
          'זמן קצר'
        ]
      },
      budget: {
        high: [
          'התקציב שלי הוא',
          'יש לי',
          'משכנתא מאושרת',
          'כסף מזומן',
          'המשכנתא שלי מאושרת',
          'אלף שקל',
          'אלפי שקלים',
          'משכנתא',
          'הון עצמי',
          'תקציב'
        ],
        medium: [
          'אני יכול לשלם',
          'יש לי כסף',
          'תקציב של',
          'עד'
        ]
      },
      interest: {
        high: [
          'זה בדיוק מה שחיפשתי',
          'אני אוהב את המיקום',
          'מתי אפשר לראות את הנכס',
          'מה השטח המדויק',
          'איך נראה הנוף',
          'אני מעוניין',
          'זה נשמע טוב',
          'אני רוצה להמשיך',
          'מה השלב הבא',
          'מתי אפשר לראות',
          'איך נראה',
          'מה השטח',
          'אני אוהב',
          'זה בדיוק'
        ],
        medium: [
          'אני רוצה לראות',
          'מתי אפשר',
          'איך',
          'מה'
        ]
      },
      engagement: {
        high: [
          'תשלח לי פרטים נוספים',
          'אני רוצה לשמוע עוד',
          'תוכל לשלוח לי',
          'אני רוצה לדעת יותר',
          'תוכל להסביר',
          'אני רוצה לשמוע',
          'תשלח לי',
          'אני רוצה לדעת',
          'תוכל לספר לי',
          'אני רוצה לשמוע עוד'
        ],
        medium: [
          'אני רוצה',
          'תוכל',
          'אפשר',
          'איך'
        ]
      }
    };

    // Objection phrases (negative indicators)
    this.objectionPhrases = [
      'זה יקר מדי',
      'אני צריך לחשוב',
      'אני אחזור אליך',
      'יש לי עוד אפשרויות',
      'זה יקר',
      'אני לא בטוח',
      'אני צריך לחשוב על זה',
      'אני אתקשר אליך',
      'אני אחזור',
      'לא בטוח',
      'יקר מדי',
      'אני צריך לחשוב'
    ];
  }

  /**
   * Analyze Hebrew transcript and calculate scores
   * @param {string} transcript - Hebrew transcript text
   * @param {number} duration - Call duration in seconds
   * @param {number} wordCount - Number of words in transcript
   * @returns {Object} Scoring results
   */
  analyzeTranscript(transcript, duration = 0, wordCount = 0) {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Transcript is required for analysis');
    }

    const normalizedText = this.normalizeHebrewText(transcript);
    
    // Calculate individual scores
    const urgencyScore = this.calculateUrgencyScore(normalizedText);
    const budgetScore = this.calculateBudgetScore(normalizedText);
    const interestScore = this.calculateInterestScore(normalizedText);
    const engagementScore = this.calculateEngagementScore(normalizedText, duration, wordCount);

    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      urgency: urgencyScore,
      budget: budgetScore,
      interest: interestScore,
      engagement: engagementScore
    });

    // Extract key phrases found
    const keyPhrases = this.extractKeyPhrases(normalizedText);
    const objections = this.detectObjections(normalizedText);

    // Generate analysis notes
    const analysisNotes = this.generateAnalysisNotes({
      urgencyScore,
      budgetScore,
      interestScore,
      engagementScore,
      overallScore,
      keyPhrases,
      objections,
      duration,
      wordCount
    });

    return {
      scores: {
        urgency: urgencyScore,
        budget: budgetScore,
        interest: interestScore,
        engagement: engagementScore,
        overall: overallScore
      },
      analysis: {
        keyPhrases,
        objections,
        notes: analysisNotes,
        confidence: this.calculateConfidence(normalizedText, wordCount)
      },
      metadata: {
        duration,
        wordCount,
        wordsPerMinute: duration > 0 ? Math.round((wordCount / duration) * 60) : 0
      }
    };
  }

  /**
   * Normalize Hebrew text for analysis
   * @param {string} text - Hebrew text
   * @returns {string} Normalized text
   */
  normalizeHebrewText(text) {
    return text
      .toLowerCase()
      .replace(/[^\u0590-\u05FF\u2000-\u206F\s]/g, '') // Keep Hebrew, spaces, and punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Calculate urgency score (0-100)
   * @param {string} text - Normalized Hebrew text
   * @returns {number} Urgency score
   */
  calculateUrgencyScore(text) {
    let score = 0;
    let highMatches = 0;
    let mediumMatches = 0;

    // Check for high urgency phrases
    this.hebrewPhrases.urgency.high.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        highMatches++;
        score += 25; // High weight for urgency phrases
      }
    });

    // Check for medium urgency phrases
    this.hebrewPhrases.urgency.medium.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        mediumMatches++;
        score += 10; // Medium weight
      }
    });

    // Bonus for multiple urgency indicators
    if (highMatches > 1) score += 15;
    if (mediumMatches > 2) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate budget clarity score (0-100)
   * @param {string} text - Normalized Hebrew text
   * @returns {number} Budget score
   */
  calculateBudgetScore(text) {
    let score = 0;
    let highMatches = 0;
    let mediumMatches = 0;

    // Check for high budget clarity phrases
    this.hebrewPhrases.budget.high.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        highMatches++;
        score += 20; // High weight for budget clarity
      }
    });

    // Check for medium budget phrases
    this.hebrewPhrases.budget.medium.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        mediumMatches++;
        score += 8; // Medium weight
      }
    });

    // Look for specific budget amounts (Hebrew numbers)
    const budgetPatterns = [
      /(\d+)\s*אלף\s*שקל/,
      /(\d+)\s*אלפי\s*שקלים/,
      /תקציב\s*של\s*(\d+)/,
      /עד\s*(\d+)/
    ];

    budgetPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match) {
        score += 15; // Bonus for specific amounts
        highMatches++;
      }
    });

    // Bonus for multiple budget indicators
    if (highMatches > 1) score += 10;
    if (mediumMatches > 2) score += 8;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate property interest score (0-100)
   * @param {string} text - Normalized Hebrew text
   * @returns {number} Interest score
   */
  calculateInterestScore(text) {
    let score = 0;
    let highMatches = 0;
    let mediumMatches = 0;

    // Check for high interest phrases
    this.hebrewPhrases.interest.high.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        highMatches++;
        score += 20; // High weight for interest
      }
    });

    // Check for medium interest phrases
    this.hebrewPhrases.interest.medium.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        mediumMatches++;
        score += 8; // Medium weight
      }
    });

    // Count question marks (indicates interest)
    const questionCount = (text.match(/\?/g) || []).length;
    score += questionCount * 5; // 5 points per question

    // Bonus for multiple interest indicators
    if (highMatches > 1) score += 10;
    if (mediumMatches > 2) score += 8;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate engagement score (0-100)
   * @param {string} text - Normalized Hebrew text
   * @param {number} duration - Call duration in seconds
   * @param {number} wordCount - Number of words
   * @returns {number} Engagement score
   */
  calculateEngagementScore(text, duration, wordCount) {
    let score = 0;
    let highMatches = 0;
    let mediumMatches = 0;

    // Check for high engagement phrases
    this.hebrewPhrases.engagement.high.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        highMatches++;
        score += 15; // High weight for engagement
      }
    });

    // Check for medium engagement phrases
    this.hebrewPhrases.engagement.medium.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        mediumMatches++;
        score += 6; // Medium weight
      }
    });

    // Duration-based scoring
    if (duration > 120) { // More than 2 minutes
      score += 20;
    } else if (duration > 60) { // More than 1 minute
      score += 10;
    }

    // Word count-based scoring
    if (wordCount > 100) {
      score += 15;
    } else if (wordCount > 50) {
      score += 8;
    }

    // Words per minute (engagement indicator)
    const wordsPerMinute = duration > 0 ? (wordCount / duration) * 60 : 0;
    if (wordsPerMinute > 120) {
      score += 10; // High engagement
    } else if (wordsPerMinute > 80) {
      score += 5; // Medium engagement
    }

    // Bonus for multiple engagement indicators
    if (highMatches > 1) score += 8;
    if (mediumMatches > 2) score += 6;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate overall score using weighted formula
   * @param {Object} scores - Individual scores
   * @returns {number} Overall score
   */
  calculateOverallScore(scores) {
    const overall = 
      (scores.urgency * this.weights.urgency) +
      (scores.budget * this.weights.budget) +
      (scores.interest * this.weights.interest) +
      (scores.engagement * this.weights.engagement);

    return Math.round(overall);
  }

  /**
   * Extract key phrases found in the transcript
   * @param {string} text - Normalized Hebrew text
   * @returns {Object} Key phrases by category
   */
  extractKeyPhrases(text) {
    const phrases = {
      urgency: [],
      budget: [],
      interest: [],
      engagement: []
    };

    Object.keys(this.hebrewPhrases).forEach(category => {
      this.hebrewPhrases[category].high.forEach(phrase => {
        if (text.includes(phrase.toLowerCase())) {
          phrases[category].push(phrase);
        }
      });
    });

    return phrases;
  }

  /**
   * Detect objection phrases in the transcript
   * @param {string} text - Normalized Hebrew text
   * @returns {Array} Objection phrases found
   */
  detectObjections(text) {
    return this.objectionPhrases.filter(phrase => 
      text.includes(phrase.toLowerCase())
    );
  }

  /**
   * Calculate confidence level of the analysis
   * @param {string} text - Normalized Hebrew text
   * @param {number} wordCount - Number of words
   * @returns {number} Confidence percentage
   */
  calculateConfidence(text, wordCount) {
    let confidence = 50; // Base confidence

    // More words = higher confidence
    if (wordCount > 100) confidence += 20;
    else if (wordCount > 50) confidence += 10;

    // More key phrases = higher confidence
    const totalPhrases = Object.values(this.extractKeyPhrases(text))
      .flat().length;
    
    if (totalPhrases > 5) confidence += 20;
    else if (totalPhrases > 2) confidence += 10;

    return Math.min(100, confidence);
  }

  /**
   * Generate analysis notes based on scores and findings
   * @param {Object} data - Analysis data
   * @returns {string} Analysis notes
   */
  generateAnalysisNotes(data) {
    const notes = [];

    // Overall assessment
    if (data.overallScore >= 80) {
      notes.push("לקוח בעל פוטנציאל גבוה לסגירת עסקה - מומלץ לעקוב אחריו באופן מיידי");
    } else if (data.overallScore >= 60) {
      notes.push("לקוח בעל פוטנציאל טוב - מומלץ לשמור על קשר");
    } else if (data.overallScore >= 40) {
      notes.push("לקוח עם פוטנציאל בינוני - נדרש מעקב נוסף");
    } else {
      notes.push("לקוח עם פוטנציאל נמוך - מומלץ להתמקד בלקוחות אחרים");
    }

    // Specific insights
    if (data.urgencyScore >= 70) {
      notes.push("לקוח עם תחושת דחיפות גבוהה - הזדמנות לסגירה מהירה");
    }

    if (data.budgetScore >= 70) {
      notes.push("לקוח עם תקציב ברור - פוטנציאל לסגירה בטווח הקצר");
    }

    if (data.interestScore >= 70) {
      notes.push("לקוח מתעניין מאוד בנכס - מומלץ להציע צפייה");
    }

    if (data.engagementScore >= 70) {
      notes.push("לקוח מעורב מאוד בשיחה - סימן חיובי לכוונה לקנות");
    }

    // Objections
    if (data.objections.length > 0) {
      notes.push(`זוהו התנגדויות: ${data.objections.join(', ')} - נדרש טיפול בהתנגדויות`);
    }

    // Call quality
    if (data.duration > 120) {
      notes.push("שיחה ארוכה - סימן לעניין גבוה");
    }

    if (data.wordCount > 100) {
      notes.push("לקוח דיבר הרבה - סימן למעורבות גבוהה");
    }

    return notes.join('. ') + '.';
  }

  /**
   * Get scoring weights for reference
   * @returns {Object} Scoring weights
   */
  getWeights() {
    return this.weights;
  }

  /**
   * Get Hebrew phrases for reference
   * @returns {Object} Hebrew phrases by category
   */
  getPhrases() {
    return this.hebrewPhrases;
  }
}

module.exports = new ScoringService(); 