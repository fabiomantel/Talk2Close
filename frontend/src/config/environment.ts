// Environment Configuration
export const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://talk2close.fly.dev/api',
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'https://talk2close.fly.dev',
  APP_NAME: process.env.REACT_APP_NAME || 'Hebrew Sales Call Analysis',
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'production',
  DEFAULT_LOCALE: process.env.REACT_APP_DEFAULT_LOCALE || 'he-IL',
  RTL_SUPPORT: process.env.REACT_APP_RTL_SUPPORT === 'true',
  DEBUG_MODE: process.env.REACT_APP_ENABLE_DEBUG_MODE === 'true',
};

// Validate required configuration
export const validateConfig = () => {
  const warnings: string[] = [];
  
  if (!process.env.REACT_APP_API_BASE_URL) {
    warnings.push('REACT_APP_API_BASE_URL not set, using default: http://localhost:3002/api');
  }
  
  if (!process.env.REACT_APP_BACKEND_URL) {
    warnings.push('REACT_APP_BACKEND_URL not set, using default: http://localhost:3002');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Environment Configuration Warnings:', warnings);
  }
  
  return warnings;
};

// Initialize configuration validation
validateConfig(); 