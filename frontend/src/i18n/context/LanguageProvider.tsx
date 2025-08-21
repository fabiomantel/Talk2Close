import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageCode, RTL_LANGUAGES } from '../types/translationKeys';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  isRTL: boolean;
  changeLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: LanguageCode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  defaultLanguage = 'he' 
}) => {
  const { i18n, t, ready } = useTranslation();
  
  const changeLanguage = useCallback(async (lang: LanguageCode) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('app-language', lang);
  }, [i18n]);
  
  const isRTL = RTL_LANGUAGES.includes(i18n.language as LanguageCode);
  
  // Initialize language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as LanguageCode;
    if (savedLanguage && savedLanguage !== i18n.language) {
      changeLanguage(savedLanguage);
    }
  }, [changeLanguage, i18n.language]);
  
  // Wait for i18n to be ready
  if (!ready) {
    return <div>Loading...</div>;
  }

  const value: LanguageContextType = {
    currentLanguage: i18n.language as LanguageCode,
    isRTL,
    changeLanguage,
    t,
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
