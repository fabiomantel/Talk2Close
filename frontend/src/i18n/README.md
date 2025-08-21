# Internationalization (i18n) System

This document describes the comprehensive internationalization system implemented for the Hebrew Sales Call Analysis System.

## Overview

The i18n system provides:
- **Type-safe translations** with TypeScript
- **Hebrew (RTL) and English (LTR)** support
- **Namespace organization** by feature
- **Automatic language detection** and persistence
- **RTL/LTR layout switching**
- **Backward compatibility** with existing code

## Architecture

### Directory Structure
```
src/i18n/
├── config/
│   └── i18n.ts              # i18n configuration
├── locales/
│   ├── he/                  # Hebrew translations
│   │   ├── common.json
│   │   ├── dashboard.json
│   │   ├── customers.json
│   │   ├── analysis.json
│   │   ├── upload.json
│   │   └── configuration.json
│   └── en/                  # English translations
│       ├── common.json
│       ├── dashboard.json
│       ├── customers.json
│       ├── analysis.json
│       ├── upload.json
│       └── configuration.json
├── types/
│   └── translationKeys.ts   # TypeScript type definitions
├── hooks/
│   └── useTranslation.ts    # Custom translation hooks
├── context/
│   └── LanguageProvider.tsx # React Context for language state
└── index.ts                 # Main exports
```

## Usage

### Basic Translation Hook

```typescript
import { useCommonTranslation } from '../i18n/hooks/useTranslation';

const MyComponent = () => {
  const { t } = useCommonTranslation();
  
  return (
    <div>
      <h1>{t('common.loading')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

### Feature-Specific Translation Hooks

```typescript
import { useDashboardTranslation, useAnalysisTranslation } from '../i18n/hooks/useTranslation';

const DashboardComponent = () => {
  const { t: tDashboard } = useDashboardTranslation();
  const { t: tAnalysis } = useAnalysisTranslation();
  
  return (
    <div>
      <h1>{tDashboard('dashboard.title')}</h1>
      <p>{tAnalysis('analysis.results')}</p>
    </div>
  );
};
```

### Language Management

```typescript
import { useLanguage } from '../i18n/context/LanguageProvider';

const LanguageComponent = () => {
  const { currentLanguage, isRTL, changeLanguage } = useLanguage();
  
  const handleLanguageChange = async () => {
    const newLang = currentLanguage === 'he' ? 'en' : 'he';
    await changeLanguage(newLang);
  };
  
  return (
    <div>
      <p>Current Language: {currentLanguage}</p>
      <p>RTL: {isRTL ? 'Yes' : 'No'}</p>
      <button onClick={handleLanguageChange}>
        Switch to {currentLanguage === 'he' ? 'English' : 'Hebrew'}
      </button>
    </div>
  );
};
```

### Language Toggle Component

```typescript
import { LanguageToggle } from '../components/common/LanguageToggle';

const Header = () => {
  return (
    <header>
      <h1>My App</h1>
      <LanguageToggle />
    </header>
  );
};
```

## Type Safety

### Translation Keys

All translation keys are typed and validated at compile time:

```typescript
// This will show TypeScript errors for invalid keys
const { t } = useCommonTranslation();
t('common.invalid_key'); // ❌ TypeScript error
t('common.loading');     // ✅ Valid key
```

### Namespace Organization

Translations are organized by feature:

- **common**: UI elements, status, errors
- **dashboard**: Dashboard-specific content
- **customers**: Customer management
- **analysis**: Analysis results and insights
- **upload**: File upload functionality
- **configuration**: System configuration

## RTL Support

### Automatic RTL Detection

The system automatically detects RTL languages and applies appropriate styling:

```typescript
const { isRTL } = useLanguage();

return (
  <div className={`layout ${isRTL ? 'rtl-layout' : 'ltr-layout'}`}>
    <p className={isRTL ? 'hebrew-content' : ''}>
      {t('common.loading')}
    </p>
  </div>
);
```

### CSS Classes

The system provides CSS classes for RTL support:

- `.rtl-layout`: RTL direction and text alignment
- `.hebrew-content`: Hebrew font and styling
- `.rtl-header`: RTL header layout
- `.rtl-sidebar`: RTL sidebar layout

## Configuration

### App Integration

Wrap your app with the LanguageProvider:

```typescript
import { LanguageProvider } from './i18n/context/LanguageProvider';

function App() {
  return (
    <LanguageProvider defaultLanguage="he">
      {/* Your app components */}
    </LanguageProvider>
  );
}
```

### Environment Variables

The system respects these environment variables:

- `REACT_APP_DEFAULT_LOCALE`: Default language (default: 'he-IL')
- `REACT_APP_RTL_SUPPORT`: Enable RTL support (default: true)

## Migration from Legacy System

### Backward Compatibility

The system maintains backward compatibility with the existing `getUIText` function:

```typescript
import { getUIText } from '../utils/hebrewUtils';

// This still works but now uses the new i18n system
const text = getUIText('dashboard');
```

### Migration Steps

1. **Replace direct usage**:
   ```typescript
   // Old
   const text = getUIText('dashboard');
   
   // New
   const { t } = useDashboardTranslation();
   const text = t('dashboard.title');
   ```

2. **Update components** to use the new hooks
3. **Add language toggle** to your header
4. **Test RTL/LTR switching**

## Best Practices

### 1. Use Feature-Specific Hooks

```typescript
// ✅ Good - Use specific hooks
const { t } = useDashboardTranslation();
t('dashboard.title');

// ❌ Avoid - Using common hook for specific features
const { t } = useCommonTranslation();
t('dashboard.title'); // This might not work
```

### 2. Handle RTL Layout

```typescript
const { isRTL } = useLanguage();

return (
  <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
    <Sidebar />
    <Main />
  </div>
);
```

### 3. Use Type-Safe Keys

```typescript
// ✅ Good - TypeScript will catch errors
const { t } = useCommonTranslation();
t('common.loading');

// ❌ Avoid - No type safety
const { t } = useCommonTranslation();
t('invalid.key');
```

### 4. Organize Translations by Feature

Keep translations organized by feature to maintain clarity and avoid conflicts.

## Testing

### Mock Translation Hook

```typescript
// tests/mocks/i18n.ts
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      dir: () => 'ltr',
      changeLanguage: jest.fn(),
    },
    ready: true,
  }),
}));
```

### Test Language Switching

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageToggle } from '../components/common/LanguageToggle';

test('language toggle switches language', () => {
  render(<LanguageToggle />);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
  
  // Verify language change
  expect(button).toHaveTextContent('עב');
});
```

## Troubleshooting

### Common Issues

1. **Translation not found**: Check if the key exists in the correct namespace
2. **RTL not working**: Ensure the LanguageProvider is wrapping your app
3. **TypeScript errors**: Verify translation keys match the type definitions

### Debug Mode

Enable debug mode in development:

```typescript
// The system automatically enables debug mode in development
// Check browser console for translation debugging information
```

## Future Enhancements

1. **Additional Languages**: Easy to add more languages
2. **Pluralization**: Support for plural forms
3. **Interpolation**: Dynamic content in translations
4. **Lazy Loading**: Load translations on demand
5. **Translation Management**: Admin interface for managing translations

## Contributing

When adding new translations:

1. Add keys to the TypeScript types
2. Add translations to both Hebrew and English files
3. Update this documentation if needed
4. Test RTL/LTR switching
5. Verify TypeScript compilation
