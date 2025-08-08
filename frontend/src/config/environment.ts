// Environment Configuration
const getBackendUrl = () => {
  return process.env.REACT_APP_BACKEND_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://talk2close.fly.dev');
};

export const config = {
  BACKEND_URL: getBackendUrl(),
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || `${getBackendUrl()}/api`,
  APP_NAME: process.env.REACT_APP_NAME || 'Hebrew Sales Call Analysis',
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || (process.env.NODE_ENV === 'development' ? 'development' : 'production'),
  DEFAULT_LOCALE: process.env.REACT_APP_DEFAULT_LOCALE || 'he-IL',
  RTL_SUPPORT: process.env.REACT_APP_RTL_SUPPORT === 'true',
  DEBUG_MODE: process.env.REACT_APP_ENABLE_DEBUG_MODE === 'true',
};

// Debug configuration in development
if (process.env.NODE_ENV === 'development' || config.DEBUG_MODE) {
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL: config.API_BASE_URL,
    BACKEND_URL: config.BACKEND_URL,
    ENVIRONMENT: config.ENVIRONMENT,
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
    REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  });
}

// Validate required configuration
export const validateConfig = () => {
  const warnings: string[] = [];
  
  if (!process.env.REACT_APP_API_BASE_URL) {
    warnings.push(`REACT_APP_API_BASE_URL not set, using default: ${config.API_BASE_URL}`);
  }
  
  if (!process.env.REACT_APP_BACKEND_URL) {
    warnings.push(`REACT_APP_BACKEND_URL not set, using default: ${config.BACKEND_URL}`);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Environment Configuration Warnings:', warnings);
  }
  
  return warnings;
};

// Initialize configuration validation
validateConfig(); 