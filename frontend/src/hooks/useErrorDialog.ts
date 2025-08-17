import { useState, useCallback } from 'react';
import { ErrorDetails } from '../components/common/ErrorDialog';

interface UseErrorDialogReturn {
  error: ErrorDetails | null;
  isOpen: boolean;
  showError: (error: ErrorDetails | string) => void;
  hideError: () => void;
  clearError: () => void;
}

export const useErrorDialog = (): UseErrorDialogReturn => {
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showError = useCallback((errorInput: ErrorDetails | string) => {
    let errorDetails: ErrorDetails;

    if (typeof errorInput === 'string') {
      errorDetails = {
        message: errorInput,
        timestamp: new Date().toISOString()
      };
    } else {
      errorDetails = {
        ...errorInput,
        timestamp: errorInput.timestamp || new Date().toISOString()
      };
    }

    setError(errorDetails);
    setIsOpen(true);
  }, []);

  const hideError = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setIsOpen(false);
  }, []);

  return {
    error,
    isOpen,
    showError,
    hideError,
    clearError
  };
};

// Utility function to extract error details from API errors
export const extractErrorDetails = (error: any): ErrorDetails => {
  if (error?.response) {
    // Axios-like error
    const response = error.response;
    return {
      message: response.data?.error || response.data?.message || error.message || 'Unknown error occurred',
      statusCode: response.status,
      endpoint: response.config?.url,
      details: response.data?.details || response.data?.error,
      timestamp: new Date().toISOString()
    };
  } else if (error?.message) {
    // Standard Error object
    return {
      message: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    };
  } else {
    // Fallback
    return {
      message: String(error) || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
  }
};

// Utility function to handle API errors in mutations
export const handleApiError = (error: any, showError: (error: ErrorDetails | string) => void) => {
  console.error('API Error:', error);
  
  const errorDetails = extractErrorDetails(error);
  showError(errorDetails);
};
