import React from 'react';
import { useLanguage } from '../../i18n/context/LanguageProvider';
import { useCommonTranslation } from '../../i18n/hooks/useTranslation';
import { LanguageToggle } from './LanguageToggle';

const Header: React.FC = () => {
  const { t } = useCommonTranslation();
  const { isRTL } = useLanguage();

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${isRTL ? 'rtl-header' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className={`flex items-center ${isRTL ? 'rtl-justify-end' : ''}`}>
            <h1 className={`text-2xl font-bold text-gray-900 ${isRTL ? 'hebrew-content' : ''}`}>
              {isRTL ? 'מערכת ניתוח שיחות מכירה בעברית' : 'Hebrew Sales Call Analysis System'}
            </h1>
          </div>
          <div className={`flex items-center space-x-4 ${isRTL ? 'rtl-space-x-reverse' : ''}`}>
            <div className={`text-sm text-gray-500 ${isRTL ? 'hebrew-content' : ''}`}>
              <span className="font-medium">{t('form.status')}:</span>
              <span className={`${isRTL ? 'rtl-ml-auto' : ''} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${isRTL ? 'hebrew-content' : ''}`}>
                {t('status.online')}
              </span>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 