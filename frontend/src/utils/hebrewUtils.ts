import { ScoreCategory, CategoryNames, CategoryDescriptions } from '../i18n/types/translationKeys';

// Keep existing utility functions that don't need translation
export const getScoreCategory = (score: number): ScoreCategory => {
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

// Updated to use i18n system - now accepts translation function as parameter
export const getScoreLabel = (score: number, t?: (key: string) => string): string => {
  if (!t) {
    // Fallback to English if no translation function provided
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Medium';
    return 'Low';
  }
  
  if (score >= 80) return String(t('analysis.excellent'));
  if (score >= 60) return String(t('analysis.good'));
  if (score >= 40) return String(t('analysis.medium'));
  return String(t('analysis.low'));
};

// Updated to use i18n system - now accepts translation function as parameter
export const getCategoryName = (category: string, t?: (key: string) => string): string => {
  if (!t) {
    // Fallback to English if no translation function provided
    const categoryMap: Record<string, string> = {
      urgency: 'High',
      budget: 'Medium',
      interest: 'Good',
      engagement: 'Excellent'
    };
    return categoryMap[category] || category;
  }
  
  const categoryMap: Record<string, string> = {
    urgency: String(t('analysis.high')),
    budget: String(t('analysis.medium')),
    interest: String(t('analysis.good')),
    engagement: String(t('analysis.excellent'))
  };
  
  return categoryMap[category] || category;
};

// Updated to use i18n system - now accepts translation function as parameter
export const getCategoryDescription = (category: string, t?: (key: string) => string): string => {
  if (!t) {
    // Fallback to English if no translation function provided
    const descriptions: Record<string, string> = {
      urgency: 'Weight for urgency indicators',
      budget: 'Weight for budget indicators',
      interest: 'Weight for interest indicators',
      engagement: 'Weight for engagement indicators'
    };
    return descriptions[category] || '';
  }
  
  const descriptions: Record<string, string> = {
    urgency: String(t('config.urgency_weight_help')),
    budget: String(t('config.budget_weight_help')),
    interest: String(t('config.interest_weight_help')),
    engagement: String(t('config.engagement_weight_help'))
  };
  
  return descriptions[category] || '';
};

// Keep existing utility functions
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const truncateHebrewText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Updated date formatting to use i18n - now accepts language as parameter
export const formatHebrewDate = (dateString: string, currentLanguage?: string): string => {
  const date = new Date(dateString);
  
  return date.toLocaleDateString(
    currentLanguage === 'he' ? 'he-IL' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );
};

// Legacy function for backward compatibility - now accepts translation function as parameter
export const getUIText = (key: string, t?: (key: string) => string): string => {
  if (!t) {
    // Fallback to English if no translation function provided
    const fallbackTexts: Record<string, string> = {
      'something_went_wrong': 'Something went wrong',
      'reload_page': 'Reload Page',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'save': 'Save',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'view': 'View',
      'submit': 'Submit',
      'select': 'Select',
      'refresh': 'Refresh',
      'stop': 'Stop',
      'test': 'Test',
      'create': 'Create',
      'update': 'Update'
    };
    return fallbackTexts[key] || key;
  }
  return String(t(key as any)); // Type assertion for backward compatibility
};

// New utility functions for the i18n system - now accept translation functions as parameters
export const getScoreLabels = (t?: (key: string) => string): Record<ScoreCategory, string> => {
  if (!t) {
    return {
      high: 'High',
      good: 'Good',
      medium: 'Medium',
      low: 'Low',
    };
  }
  
  return {
    high: String(t('analysis.high')),
    good: String(t('analysis.good')),
    medium: String(t('analysis.medium')),
    low: String(t('analysis.low')),
  };
};

export const getCategoryNames = (t?: (key: string) => string): CategoryNames => {
  if (!t) {
    return {
      urgency: 'Urgency',
      budget: 'Budget',
      interest: 'Interest',
      engagement: 'Engagement',
    };
  }
  
  return {
    urgency: String(t('config.weights.urgency')),
    budget: String(t('config.weights.budget')),
    interest: String(t('config.weights.interest')),
    engagement: String(t('config.weights.engagement')),
  };
};

export const getCategoryDescriptions = (t?: (key: string) => string): CategoryDescriptions => {
  if (!t) {
    return {
      urgency: 'Weight for urgency indicators',
      budget: 'Weight for budget indicators',
      interest: 'Weight for interest indicators',
      engagement: 'Weight for engagement indicators',
    };
  }
  
  return {
    urgency: String(t('config.urgency_weight_help')),
    budget: String(t('config.budget_weight_help')),
    interest: String(t('config.interest_weight_help')),
    engagement: String(t('config.engagement_weight_help')),
  };
}; 