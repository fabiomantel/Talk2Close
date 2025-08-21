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
    'batch_processing': 'עיבוד מרוכז',
    'configuration': 'הגדרות',
    'folders': 'תיקיות',
    'notifications': 'התראות',
    'batch_processing_page_description': 'עבד אוטומטית מספר רב של הקלטות שיחות מכירה בעברית מתיקיות חיצוניות',
    
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
    'actions': 'פעולות',
    'view_details': 'צפה בפרטים',
    'stop': 'עצור',
    'test': 'בדיקה',
    'active': 'פעיל',
    'inactive': 'לא פעיל',
    'select': 'בחר',
    'all_status': 'כל הסטטוסים',
    'pending': 'ממתין',
    'running': 'רץ',
    'completed': 'הושלם',
    'failed': 'נכשל',
    'cancelled': 'בוטל',
    'retrying': 'מנסה שוב',
    'skipped': 'דולג',
    'discovered': 'התגלה',
    'queued': 'בתור',
    'processing': 'מעבד',
    
    // Navigation
    'dashboard_nav': 'לוח בקרה',
    'customers_nav': 'לקוחות',
    'analysis_nav': 'ניתוח',
    'upload_nav': 'העלאה',
    'batch_processing_nav': 'עיבוד מרוכז',
    'configuration_nav': 'הגדרות',
    'debug': 'דיבאג',
    
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
    
    // Error Messages
    'something_went_wrong': 'משהו השתבש',
    'try_again': 'נסה שוב',
    'contact_support': 'צור קשר עם התמיכה',
    'file_too_large': 'הקובץ גדול מדי',
    'invalid_file_type': 'סוג קובץ לא נתמך',
    'network_error': 'שגיאת רשת',
    'server_error': 'שגיאת שרת',
    
    // Batch Processing Dashboard
    'batch_processing_dashboard': 'לוח בקרת עיבוד מרוכז',
    'batch_processing_description': 'ניטור וניהול פעולות עיבוד קבצים מרוכז',
    'start_new_batch': 'התחל עיבוד מרוכז חדש',
    'total_files_processed': 'סה"כ קבצים שעובדו',
    'success_rate': 'אחוז הצלחה',
    'avg_processing_time': 'זמן עיבוד ממוצע',
    'active_jobs': 'תהליכים פעילים',
    'system_status': 'סטטוס מערכת',
    'idle': 'פנוי',
    'recent_batch_jobs': 'תהליכי עיבוד מרוכז אחרונים',
    'no_batch_jobs': 'אין תהליכי עיבוד מרוכז',
    'no_batch_jobs_description': 'התחל על ידי יצירת תהליך עיבוד מרוכז חדש',
    'job_name': 'שם תהליך',
    'progress': 'התקדמות',
    'started': 'התחיל',
    'failed_files': 'קבצים שנכשלו',
    'active_jobs_count': 'תהליכים פעילים',
    
    // Folder Management
    'folder_management': 'ניהול תיקיות',
    'folder_management_description': 'נהל תיקיות חיצוניות לעיבוד קבצים',
    'add_folder': 'הוסף תיקייה',
    'edit_folder': 'ערוך תיקייה',
    'delete_folder': 'מחק תיקייה',
    'test_connection': 'בדוק חיבור',
    'folder_name': 'שם התיקייה',
    'storage_provider': 'ספק אחסון',
    'monitor_type': 'סוג ניטור',
    'max_file_size': 'גודל קובץ מקסימלי',
    'auto_start': 'התחל אוטומטית',
    'start_processing_automatically': 'התחל עיבוד אוטומטית',
    'folder_path': 'נתיב התיקייה',
    'folder_path_description': 'הנתיב המלא לתיקייה במערכת הקבצים',
    'bucket_name': 'שם הדלי',
    'prefix': 'קידומת',
    'scan_interval': 'מרווח סריקה',
    'scan_interval_description': 'מרווח הזמן בין סריקות התיקייה (בשניות)',
    'no_folders_configured': 'לא הוגדרו תיקיות',
    'no_folders_description': 'הוסף תיקייה חיצונית כדי להתחיל עיבוד קבצים',
    'folder_test_passed': 'בדיקת התיקייה הצליחה',
    'folder_test_failed': 'בדיקת התיקייה נכשלה',
    'aws_s3': 'AWS S3',
    'local_file_system': 'מערכת קבצים מקומית',
    'storage': 'אחסון',
    'monitor': 'ניטור',
    'extensions': 'סיומות',
    'last_scan': 'סריקה אחרונה',
    'saving': 'שומר...',
    'create': 'צור',
    'update': 'עדכן',
    'are_you_sure_delete_folder': 'האם אתה בטוח שברצונך למחוק תיקייה זו?',
    
    // Batch Configuration
    'batch_processing_configuration': 'הגדרות עיבוד מרוכז',
    'batch_config_description': 'הגדר הגדרות גלובליות לפעולות עיבוד מרוכז',
    'reset_to_default': 'אפס לברירת מחדל',
    'save_configuration': 'שמור הגדרות',
    'configuration_saved_successfully': 'ההגדרות נשמרו בהצלחה',
    'failed_to_save_configuration': 'שגיאה בשמירת ההגדרות',
    'configuration_reset_to_defaults': 'ההגדרות אופסו לברירת מחדל',
    'failed_to_reset_configuration': 'שגיאה באיפוס ההגדרות',
    'are_you_sure_reset': 'האם אתה בטוח שברצונך לאפס לברירת מחדל?',
    'processing_settings': 'הגדרות עיבוד',
    'max_concurrent_files': 'קבצים מקבילים מקסימליים',
    'max_concurrent_files_help': 'מספר קבצים לעיבוד במקביל (1-20)',
    'processing_triggers': 'טריגרים לעיבוד',
    'auto_start_processing': 'התחל עיבוד אוטומטית כשקבצים מתגלים',
    'process_files_immediately': 'עבד קבצים מיד עם התגלות',
    'enable_background_processing': 'אפשר עיבוד ברקע',
    'retry_configuration': 'הגדרות ניסיון חוזר',
    'enable_automatic_retries': 'אפשר ניסיונות חוזרים אוטומטיים לקבצים שנכשלו',
    'max_retries': 'ניסיונות מקסימליים',
    'delay_between_retries': 'עיכוב בין ניסיונות (שניות)',
    'use_exponential_backoff': 'השתמש בעיכוב מעריכי (העיכוב גדל עם כל ניסיון)',
    'performance_information': 'מידע ביצועים',
    'processing_capacity': 'קיבולת עיבוד',
    'files_per_minute': 'קבצים לדקה',
    'memory_usage': 'שימוש בזיכרון',
    'for_concurrent_processing': 'לעיבוד מקביל',
    'estimated_processing_time': 'זמן עיבוד משוער',
    'seconds_per_file': 'שניות לקובץ',
    'retry_attempts': 'ניסיונות חוזרים',
    'per_failed_file': 'לקובץ שנכשל',
    
    // Notification Management
    'notification_management': 'ניהול התראות',
    'notification_description': 'הגדר ערוצי התראה והתראות לעיבוד מרוכז',
    'add_notification': 'הוסף התראה',
    'notification_configuration_created': 'הגדרת התראה נוצרה בהצלחה',
    'failed_to_create_notification': 'שגיאה ביצירת הגדרת התראה',
    'notification_configuration_updated': 'הגדרת התראה עודכנה בהצלחה',
    'failed_to_update_notification': 'שגיאה בעדכון הגדרת התראה',
    'notification_configuration_deleted': 'הגדרת התראה נמחקה בהצלחה',
    'failed_to_delete_notification': 'שגיאה במחיקת הגדרת התראה',
    'test_notification_sent': 'התראה לבדיקה נשלחה בהצלחה',
    'failed_to_send_test': 'שגיאה בשליחת התראה לבדיקה',
    'are_you_sure_delete_notification': 'האם אתה בטוח שברצונך למחוק הגדרת התראה זו?',
    'notification_configurations': 'הגדרות התראה',
    'no_notifications': 'אין התראות',
    'no_notifications_description': 'התחל על ידי יצירת הגדרת התראה חדשה',
    'all_events': 'כל האירועים',
    'edit_notification': 'ערוך התראה',
    'add_notification_title': 'הוסף התראה',
    'edit_notification_title': 'ערוך התראה',
    'trigger_conditions': 'תנאי הפעלה',
    'file_processing_failed': 'עיבוד קובץ נכשל',
    'batch_job_completed': 'תהליך עיבוד מרוכז הושלם',
    'batch_job_failed': 'תהליך עיבוד מרוכז נכשל',
    'file_processed_successfully': 'קובץ עובד בהצלחה',
    'enable_this_notification': 'אפשר התראה זו',
    'skip_provider_test': 'דלג על בדיקת ספק (פיתוח בלבד)',
    'create_notification': 'צור התראה',
    'update_notification': 'עדכן התראה',
    
    // Notification Types
    'slack': 'Slack',
    'webhook': 'Webhook',
    'sms': 'SMS',
    
    // Email Configuration
    'smtp_host': 'שרת SMTP',
    'smtp_port': 'פורט SMTP',
    'from_email': 'מאימייל',
    'to_email': 'לאימייל',
    'password': 'סיסמה',
    'app_password': 'סיסמת אפליקציה',
    
    // Slack Configuration
    'webhook_url': 'כתובת Webhook',
    'channel': 'ערוץ',
    
    // Webhook Configuration
    'url': 'כתובת URL',
    'secret_key': 'מפתח סודי (אופציונלי)',
    'secret_key_help': 'מפתח סודי לאימות webhook',
    
    // SMS Configuration
    'from_number': 'מספר שולח',
    'to_number': 'מספר מקבל',
    'twilio_account_sid': 'מזהה חשבון Twilio',
    'twilio_auth_token': 'אסימון אימות Twilio',
    'auth_token': 'אסימון אימות',
    
    // Additional Error Messages
    'error_occurred': 'אירעה שגיאה',
    'folder_management_error': 'שגיאה בניהול תיקיות',
    'configuration_error': 'שגיאה בהגדרות',
    'notification_error': 'שגיאה בהתראות',
    'processing_error': 'שגיאה בעיבוד',
    'invalid_configuration': 'הגדרות לא תקינות',
    'connection_failed': 'החיבור נכשל',
    'timeout_error': 'שגיאת פסק זמן',
    'unknown_error': 'שגיאה לא ידועה',
    
    // Manual Refresh
    'refresh': 'רענן',
    'manual_refresh_only': 'רענון ידני בלבד - לחץ על כפתור הרענון לעדכון נתונים',
    'auto_refresh': 'רענון אוטומטי',
    'reload_page': 'רענן דף'
  };
  
  return translations[key] || key;
}; 