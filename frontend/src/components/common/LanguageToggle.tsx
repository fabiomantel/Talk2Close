import React from 'react';
import { useLanguage } from '../../i18n/context/LanguageProvider';
import { useCommonTranslation } from '../../i18n/hooks/useTranslation';

export const LanguageToggle: React.FC = () => {
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();
  const { t } = useCommonTranslation();

  const handleToggle = async () => {
    const newLang = currentLanguage === 'he' ? 'en' : 'he';
    await changeLanguage(newLang);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        flex items-center space-x-2 px-3 py-2 text-sm font-medium 
        bg-white border border-gray-300 rounded-md 
        hover:bg-gray-50 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-indigo-500 
        transition-colors duration-200
        ${isRTL ? 'space-x-reverse' : ''}
      `}
      title={currentLanguage === 'he' ? 'Switch to English' : 'עבור לעברית'}
      aria-label={String(t('common.language_toggle'))}
    >
      <span className="text-lg" role="img" aria-hidden="true">
        {currentLanguage === 'he' ? '🇺🇸' : '🇮🇱'}
      </span>
      <span className="hidden sm:inline">
        {currentLanguage === 'he' ? 'EN' : 'עב'}
      </span>
    </button>
  );
};
