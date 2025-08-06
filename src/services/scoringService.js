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
   * Calculate urgency score based on Hebrew phrases
   * @param {string} text - Normalized Hebrew text
   * @returns {number} Urgency score (0-100)
   */
  calculateUrgencyScore(text) {
    let score = 0;
    let highMatches = 0;
    let mediumMatches = 0;

    // Check high urgency phrases
    this.hebrewPhrases.urgency.high.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        highMatches++;
        score += 25; // Increased from 20
      }
    });

    // Check medium urgency phrases
    this.hebrewPhrases.urgency.medium.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        mediumMatches++;
        score += 15; // Increased from 10
      }
    });

    // Bonus for multiple matches
    if (highMatches >= 2) score += 20;
    if (mediumMatches >= 2) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate budget score based on Hebrew phrases
   * @param {string} text - Normalized Hebrew text
   * @returns {number} Budget score (0-100)
   */
  calculateBudgetScore(text) {
    let score = 0;
    let highMatches = 0;
    let mediumMatches = 0;

    // Check high budget phrases
    this.hebrewPhrases.budget.high.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        highMatches++;
        score += 20; // Increased from 15
      }
    });

    // Check medium budget phrases
    this.hebrewPhrases.budget.medium.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        mediumMatches++;
        score += 12; // Increased from 8
      }
    });

    // Bonus for multiple matches
    if (highMatches >= 2) score += 20;
    if (mediumMatches >= 2) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate interest score based on Hebrew phrases
   * @param {string} text - Normalized Hebrew text
   * @returns {number} Interest score (0-100)
   */
  calculateInterestScore(text) {
    let score = 0;
    let highMatches = 0;
    let mediumMatches = 0;

    // Check high interest phrases
    this.hebrewPhrases.interest.high.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        highMatches++;
        score += 20; // Increased from 15
      }
    });

    // Check medium interest phrases
    this.hebrewPhrases.interest.medium.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        mediumMatches++;
        score += 12; // Increased from 8
      }
    });

    // Bonus for multiple matches
    if (highMatches >= 2) score += 20;
    if (mediumMatches >= 2) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate engagement score based on Hebrew phrases and call metrics
   * @param {string} text - Normalized Hebrew text
   * @param {number} duration - Call duration in seconds
   * @param {number} wordCount - Number of words in transcript
   * @returns {number} Engagement score (0-100)
   */
  calculateEngagementScore(text, duration = 0, wordCount = 0) {
    let score = 0;
    let highMatches = 0;
    let mediumMatches = 0;

    // Check high engagement phrases
    this.hebrewPhrases.engagement.high.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        highMatches++;
        score += 20; // Increased from 15
      }
    });

    // Check medium engagement phrases
    this.hebrewPhrases.engagement.medium.forEach(phrase => {
      if (text.includes(phrase.toLowerCase())) {
        mediumMatches++;
        score += 12; // Increased from 8
      }
    });

    // Bonus for multiple matches
    if (highMatches >= 2) score += 20;
    if (mediumMatches >= 2) score += 10;

    // Duration bonus (more generous)
    if (duration >= 300) score += 25; // 5+ minutes
    else if (duration >= 180) score += 20; // 3+ minutes
    else if (duration >= 120) score += 15; // 2+ minutes
    else if (duration >= 60) score += 10; // 1+ minute

    // Word count bonus (more generous)
    if (wordCount >= 150) score += 20;
    else if (wordCount >= 100) score += 15;
    else if (wordCount >= 50) score += 10;
    else if (wordCount >= 25) score += 5;

    return Math.min(100, score);
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

    // Overall assessment with more variety
    if (data.overallScore >= 85) {
      notes.push("לקוח בעל פוטנציאל גבוה מאוד לסגירת עסקה - מומלץ לעקוב אחריו באופן מיידי וקריטי");
    } else if (data.overallScore >= 75) {
      notes.push("לקוח בעל פוטנציאל גבוה לסגירת עסקה - מומלץ לעקוב אחריו באופן מיידי");
    } else if (data.overallScore >= 60) {
      notes.push("לקוח בעל פוטנציאל טוב - מומלץ לשמור על קשר ולחזק את הקשר");
    } else if (data.overallScore >= 45) {
      notes.push("לקוח עם פוטנציאל בינוני - נדרש מעקב נוסף וניסיון לחזק את העניין");
    } else if (data.overallScore >= 30) {
      notes.push("לקוח עם פוטנציאל נמוך - מומלץ להתמקד בלקוחות אחרים או לנסות גישה שונה");
    } else {
      notes.push("לקוח עם פוטנציאל נמוך מאוד - לא מומלץ להשקיע זמן נוסף");
    }

    // Detailed urgency insights
    if (data.urgencyScore >= 85) {
      notes.push("לקוח עם תחושת דחיפות גבוהה מאוד - הזדמנות לסגירה מהירה, יש לחץ זמן חזק");
    } else if (data.urgencyScore >= 70) {
      notes.push("לקוח עם תחושת דחיפות גבוהה - הזדמנות לסגירה מהירה");
    } else if (data.urgencyScore >= 50) {
      notes.push("לקוח עם תחושת דחיפות בינונית - יש קצת לחץ זמן");
    } else if (data.urgencyScore < 30) {
      notes.push("לקוח ללא תחושת דחיפות - אין לחץ זמן מיוחד");
    }

    // Detailed budget insights
    if (data.budgetScore >= 85) {
      notes.push("לקוח עם תקציב ברור מאוד - פוטנציאל לסגירה בטווח הקצר, תקציב מוגדר היטב");
    } else if (data.budgetScore >= 70) {
      notes.push("לקוח עם תקציב ברור - פוטנציאל לסגירה בטווח הקצר");
    } else if (data.budgetScore >= 50) {
      notes.push("לקוח עם תקציב חלקי - נדרש לברר פרטים נוספים על התקציב");
    } else if (data.budgetScore < 30) {
      notes.push("לקוח ללא תקציב ברור - נדרש לברר את המצב הפיננסי");
    }

    // Detailed interest insights
    if (data.interestScore >= 85) {
      notes.push("לקוח מתעניין מאוד בנכס - מומלץ להציע צפייה מיידית, עניין גבוה מאוד");
    } else if (data.interestScore >= 70) {
      notes.push("לקוח מתעניין מאוד בנכס - מומלץ להציע צפייה");
    } else if (data.interestScore >= 50) {
      notes.push("לקוח עם עניין בינוני - נדרש לחזק את העניין");
    } else if (data.interestScore < 30) {
      notes.push("לקוח עם עניין נמוך - נדרש לעורר עניין או לשנות גישה");
    }

    // Detailed engagement insights
    if (data.engagementScore >= 85) {
      notes.push("לקוח מעורב מאוד בשיחה - סימן חיובי לכוונה לקנות, מעורבות גבוהה מאוד");
    } else if (data.engagementScore >= 70) {
      notes.push("לקוח מעורב מאוד בשיחה - סימן חיובי לכוונה לקנות");
    } else if (data.engagementScore >= 50) {
      notes.push("לקוח עם מעורבות בינונית - נדרש לחזק את המעורבות");
    } else if (data.engagementScore < 30) {
      notes.push("לקוח עם מעורבות נמוכה - נדרש לעורר מעורבות או לשנות גישה");
    }

    // Objections with more detail
    if (data.objections.length > 0) {
      const objectionCount = data.objections.length;
      if (objectionCount >= 3) {
        notes.push(`זוהו התנגדויות מרובות (${objectionCount}): ${data.objections.join(', ')} - נדרש טיפול מקיף בהתנגדויות`);
      } else if (objectionCount === 2) {
        notes.push(`זוהו התנגדויות: ${data.objections.join(', ')} - נדרש טיפול בהתנגדויות`);
      } else {
        notes.push(`זוהתה התנגדות: ${data.objections[0]} - נדרש טיפול בהתנגדות`);
      }
    }

    // Call quality insights with more detail
    if (data.duration >= 300) {
      notes.push("שיחה ארוכה מאוד (5+ דקות) - סימן לעניין גבוה מאוד ומעורבות חזקה");
    } else if (data.duration >= 180) {
      notes.push("שיחה ארוכה (3+ דקות) - סימן לעניין גבוה");
    } else if (data.duration >= 120) {
      notes.push("שיחה בינונית (2+ דקות) - סימן לעניין בינוני");
    } else if (data.duration < 60) {
      notes.push("שיחה קצרה - סימן לעניין נמוך או חוסר זמן");
    }

    if (data.wordCount >= 200) {
      notes.push("לקוח דיבר הרבה מאוד - סימן למעורבות גבוהה מאוד ועניין חזק");
    } else if (data.wordCount >= 100) {
      notes.push("לקוח דיבר הרבה - סימן למעורבות גבוהה");
    } else if (data.wordCount >= 50) {
      notes.push("לקוח דיבר בינוני - סימן למעורבות בינונית");
    } else if (data.wordCount < 25) {
      notes.push("לקוח דיבר מעט - סימן למעורבות נמוכה");
    }

    // Additional insights based on score combinations
    if (data.urgencyScore >= 70 && data.budgetScore >= 70) {
      notes.push("שילוב מצוין: דחיפות גבוהה + תקציב ברור - הזדמנות אידיאלית לסגירה");
    }

    if (data.interestScore >= 70 && data.engagementScore >= 70) {
      notes.push("שילוב חיובי: עניין גבוה + מעורבות גבוהה - לקוח מוכן לשלב הבא");
    }

    if (data.overallScore >= 70 && data.objections.length === 0) {
      notes.push("לקוח אידיאלי: ציון גבוה ללא התנגדויות - מומלץ לקדם לשלב הבא");
    }

    if (data.overallScore < 40 && data.objections.length > 0) {
      notes.push("לקוח מאתגר: ציון נמוך עם התנגדויות - נדרש שינוי גישה או התמקדות בלקוחות אחרים");
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