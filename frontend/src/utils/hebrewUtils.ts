export const getScoreCategory = (score: number): string => {
  console.log('🎯 Score Category Calculation:', { score });
  
  if (score >= 80) return 'high';
  if (score >= 60) return 'good';
  if (score >= 40) return 'medium';
  return 'low';
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-blue-600 bg-blue-50';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'מצוין';
  if (score >= 60) return 'טוב';
  if (score >= 40) return 'בינוני';
  return 'נמוך';
};

export const formatHebrewDate = (dateString: string): string => {
  console.log('📅 Hebrew Date Formatting:', { input: dateString });
  
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  console.log('📅 Hebrew Date Result:', { formatted });
  return formatted;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const truncateHebrewText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getCategoryName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    urgency: 'דחיפות',
    budget: 'תקציב',
    interest: 'עניין',
    engagement: 'מעורבות'
  };
  return categoryNames[category] || category;
};

export const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    urgency: 'מידת הדחיפות של הלקוח לרכישה',
    budget: 'בהירות התקציב ומוכנות פיננסית',
    interest: 'רמת העניין בנכס הספציפי',
    engagement: 'רמת המעורבות והשתתפות בשיחה'
  };
  return descriptions[category] || '';
};

// UI Text Translations
export const getUIText = (key: string): string => {
  const translations: Record<string, string> = {
    // Page Titles
    'dashboard': 'לוח בקרה',
    'customers': 'לקוחות',
    'analysis': 'תוצאות ניתוח',
    'upload': 'העלאת שיחת מכירה',
    
    // Common Labels
    'name': 'שם',
    'phone': 'טלפון',
    'email': 'אימייל',
    'status': 'סטטוס',
    'date': 'תאריך',
    'score': 'ציון',
    'overall': 'כללי',
    'details': 'פרטים',
    'upload_action': 'העלאה',
    'download': 'הורדה',
    'delete': 'מחיקה',
    'edit': 'עריכה',
    'save': 'שמירה',
    'cancel': 'ביטול',
    'submit': 'שליחה',
    'loading': 'טוען...',
    'error': 'שגיאה',
    'success': 'הצלחה',
    'warning': 'אזהרה',
    'info': 'מידע',
    
    // Navigation
    'dashboard_nav': 'לוח בקרה',
    'customers_nav': 'לקוחות',
    'analysis_nav': 'ניתוח',
    'upload_nav': 'העלאה',
    
    // Dashboard
    'recent_activity': 'פעילות אחרונה',
    'score_distribution': 'התפלגות ציונים',
    'stats_overview': 'סקירת סטטיסטיקות',
    'total_customers': 'סה"כ לקוחות',
    'total_analyses': 'סה"כ ניתוחים',
    'average_score': 'ציון ממוצע',
    'high_priority': 'עדיפות גבוהה',
    'no_recent_activity': 'אין פעילות אחרונה',
    
    // Upload
    'upload_sales_call': 'העלאת שיחת מכירה',
    'upload_description': 'העלה קובץ אודיו של שיחת מכירה לניתוח',
    'select_file': 'בחר קובץ',
    'drag_drop': 'גרור ושחרר קובץ כאן, או לחץ לבחירה',
    'file_types': 'סוגי קבצים נתמכים: MP3, WAV',
    'max_size': 'גודל מקסימלי: 50MB',
    'customer_information': 'מידע לקוח',
    'upload_progress': 'מתקדם בהעלאה...',
    'upload_success': 'הקובץ הועלה בהצלחה',
    'upload_error': 'שגיאה בהעלאת הקובץ',
    
    // Analysis
    'analysis_results': 'תוצאות ניתוח',
    'score_breakdown': 'פירוט ציונים',
    'hebrew_insights': 'תובנות בעברית',
    'transcript': 'תמלול',
    'category_scores': 'ציוני קטגוריות',
    'overall_score': 'ציון כללי',
    'recent_analyses': 'ניתוחים אחרונים',
    'no_analyses': 'אין ניתוחים זמינים',
    
    // Enhanced Analysis
    'enhancedAnalysis': 'ניתוח מתקדם',
    'enhancedAnalysisNotAvailable': 'ניתוח מתקדם לא זמין',
    'enhancedAnalysisNotAvailableDesc': 'ניתוח GPT-4 לא זמין עבור ניתוח זה. ייתכן שהמפתח לא מוגדר או שהניתוח בוצע לפני הפעלת התכונה.',
    'analysisVersion': 'גרסת ניתוח',
    'sentimentAnalysis': 'ניתוח רגשי',
    'conversationFlow': 'זרימת שיחה',
    'speakerAnalysis': 'ניתוח דוברים',
    'objectionAnalysis': 'ניתוח התנגדויות',
    'contextInsights': 'תובנות הקשר',
    'confidence': 'ביטחון',
    'overallSentiment': 'רגש כללי',
    'sentimentChanges': 'שינויי רגש',
    'sentimentSummary': 'סיכום רגשי',
    'positiveSentimentSummary': 'הלקוח מראה רגש חיובי כלפי המוצר והשיחה.',
    'negativeSentimentSummary': 'הלקוח מראה רגש שלילי או חששות לגבי המוצר.',
    'neutralSentimentSummary': 'הלקוח מראה רגש ניטרלי כלפי המוצר.',
    'conversationPhases': 'שלבי שיחה',
    'totalDuration': 'משך כולל',
    'phases': 'שלבים',
    'ofConversation': 'של השיחה',
    'keyEvents': 'אירועים מרכזיים',
    'conversationSummary': 'סיכום שיחה',
    'totalPhases': 'סה"כ שלבים',
    'avgPhaseDuration': 'משך ממוצע לשלב',
    'totalEvents': 'סה"כ אירועים',
    'customerAnalysis': 'ניתוח לקוח',
    'engagementLevel': 'רמת מעורבות',
    'customerObjections': 'התנגדויות לקוח',
    'buyingSignals': 'סימני רכישה',
    'agentAnalysis': 'ניתוח נציג',
    'effectivenessLevel': 'רמת יעילות',
    'effectiveTechniques': 'טכניקות יעילות',
    'areasForImprovement': 'תחומים לשיפור',
    'interactionSummary': 'סיכום אינטראקציה',
    'customerEngagement': 'מעורבות לקוח',
    'agentEffectiveness': 'יעילות נציג',
    'objectionsRaised': 'התנגדויות שהועלו',
    'strength': 'עוצמה',
    'suggestedResponse': 'תגובה מוצעת',
    'keyInsights': 'תובנות מרכזיות',
    'recommendations': 'המלצות',
    'riskFactors': 'גורמי סיכון',
    'opportunities': 'הזדמנויות',
    'high': 'גבוה',
    'medium': 'בינוני',
    'low': 'נמוך',
    'excellent': 'מצוין',
    'good': 'טוב',
    'fair': 'הוגן',
    'poor': 'חלש',
    
    // Configuration
    'configuration': 'הגדרות',
    'configurationDescription': 'הגדר משקלים ומילים בעברית לניתוח שיחות מכירה',
    'configurationHelp': 'עזרה בהגדרות',
    'scoringWeights': 'משקלי ציון',
    'urgencyWeightHelp': 'דחיפות - מידת הדחיפות של הלקוח לרכישה',
    'budgetWeightHelp': 'תקציב - בהירות התקציב ומוכנות פיננסית',
    'interestWeightHelp': 'עניין - רמת העניין בנכס הספציפי',
    'engagementWeightHelp': 'מעורבות - רמת המעורבות והשתתפות בשיחה',
    'hebrewPhrases': 'מילים בעברית',
    'phraseHelp1': 'הוסף מילים בעברית לזיהוי דחיפות',
    'phraseHelp2': 'הגדר מילים לזיהוי תקציב ומוכנות פיננסית',
    'phraseHelp3': 'הוסף מילים לזיהוי עניין בנכס',
    'phraseHelp4': 'הגדר מילים לזיהוי מעורבות בשיחה',
    
    // Customers
    'customer_list': 'רשימת לקוחות',
    'customer_details': 'פרטי לקוח',
    'add_customer': 'הוספת לקוח',
    'search_customers': 'חיפוש לקוחות',
    'filter_customers': 'סינון לקוחות',
    'no_customers': 'אין לקוחות זמינים',
    'created_at': 'נוצר ב',
    'last_analysis': 'ניתוח אחרון',
    
    // Status
    'online': 'מחובר',
    'offline': 'מנותק',
    'processing': 'מעבד',
    'completed': 'הושלם',
    'failed': 'נכשל',
    'pending': 'ממתין',
    
    // Error Messages
    'something_went_wrong': 'משהו השתבש',
    'try_again': 'נסה שוב',
    'contact_support': 'צור קשר עם התמיכה',
    'file_too_large': 'הקובץ גדול מדי',
    'invalid_file_type': 'סוג קובץ לא נתמך',
    'network_error': 'שגיאת רשת',
    'server_error': 'שגיאת שרת'
  };
  
  return translations[key] || key;
}; 