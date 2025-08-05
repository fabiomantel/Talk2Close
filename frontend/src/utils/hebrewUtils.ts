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