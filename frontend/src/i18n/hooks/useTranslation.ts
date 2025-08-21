import { useTranslation as useI18nTranslation } from 'react-i18next';
import { TranslationNamespaces, KeysForNamespace, RTL_LANGUAGES } from '../types/translationKeys';

// Type-safe translation hook
export function useTranslation<T extends TranslationNamespaces>(
  namespace?: T
) {
  const { t, i18n, ready } = useI18nTranslation(namespace);
  
  // Type-safe translation function
  const typedT = (key: KeysForNamespace<T>, options?: any) => {
    return String(t(String(key), options));
  };
  
  // Safety check for i18n initialization
  const currentLanguage = i18n?.language as 'he' | 'en' || 'he';
  const isRTL = RTL_LANGUAGES.includes(currentLanguage);
  
  return {
    t: typedT,
    i18n,
    ready,
    currentLanguage,
    isRTL,
    changeLanguage: i18n?.changeLanguage || (() => Promise.resolve()),
  };
}

// Hook for common translations (most used)
export function useCommonTranslation() {
  return useTranslation('common');
}

// Hook for specific feature translations
export function useDashboardTranslation() {
  return useTranslation('dashboard');
}

export function useCustomersTranslation() {
  return useTranslation('customers');
}

export function useAnalysisTranslation() {
  return useTranslation('analysis');
}

export function useUploadTranslation() {
  return useTranslation('upload');
}

export function useConfigurationTranslation() {
  return useTranslation('configuration');
}
