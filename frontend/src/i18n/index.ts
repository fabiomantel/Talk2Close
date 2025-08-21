// Initialize i18n
import './config/i18n';

// Export types
export type {
  TranslationNamespaces,
  TranslationKeys,
  KeysForNamespace,
  LanguageCode,
  ScoreCategory,
  ScoreLabels,
  CategoryNames,
  CategoryDescriptions,
} from './types/translationKeys';

// Export constants
export { RTL_LANGUAGES } from './types/translationKeys';

// Export hooks
export {
  useTranslation,
  useCommonTranslation,
  useDashboardTranslation,
  useCustomersTranslation,
  useAnalysisTranslation,
  useUploadTranslation,
  useConfigurationTranslation,
} from './hooks/useTranslation';

// Export context
export {
  LanguageProvider,
  useLanguage,
} from './context/LanguageProvider';

// Export components
export { LanguageToggle } from '../components/common/LanguageToggle';
