import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LanguageCode, RTL_LANGUAGES } from '../types/translationKeys';

// Import all translation files
import heCommon from '../locales/he/common.json';
import heDashboard from '../locales/he/dashboard.json';
import heCustomers from '../locales/he/customers.json';
import heAnalysis from '../locales/he/analysis.json';
import heUpload from '../locales/he/upload.json';
import heConfiguration from '../locales/he/configuration.json';

import enCommon from '../locales/en/common.json';
import enDashboard from '../locales/en/dashboard.json';
import enCustomers from '../locales/en/customers.json';
import enAnalysis from '../locales/en/analysis.json';
import enUpload from '../locales/en/upload.json';
import enConfiguration from '../locales/en/configuration.json';

const resources = {
  he: {
    common: heCommon,
    dashboard: heDashboard,
    customers: heCustomers,
    analysis: heAnalysis,
    upload: heUpload,
    configuration: heConfiguration,
  },
  en: {
    common: enCommon,
    dashboard: enDashboard,
    customers: enCustomers,
    analysis: enAnalysis,
    upload: enUpload,
    configuration: enConfiguration,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'he',
    debug: process.env.NODE_ENV === 'development',
    
    // Namespace configuration
    ns: ['common', 'dashboard', 'customers', 'analysis', 'upload', 'configuration'],
    defaultNS: 'common',
    
    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app-language',
    },
    
    // React configuration
    react: {
      useSuspense: false, // Important for SSR compatibility
    },
    
    // Load namespaces on demand
    load: 'languageOnly',
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Key separator
    keySeparator: '.',
    nsSeparator: ':',
  });

// Set up RTL support
i18n.on('languageChanged', (lng: LanguageCode) => {
  const isRTL = RTL_LANGUAGES.includes(lng);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  // Update CSS classes
  document.body.classList.toggle('rtl', isRTL);
  document.body.classList.toggle('ltr', !isRTL);
});

export default i18n;
