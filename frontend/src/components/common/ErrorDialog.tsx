import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { getUIText } from '../../utils/hebrewUtils';

export interface ErrorDetails {
  message: string;
  code?: string;
  details?: string;
  timestamp?: string;
  endpoint?: string;
  statusCode?: number;
}

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  error: ErrorDetails | null;
  title?: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ 
  isOpen, 
  onClose, 
  error, 
  title 
}) => {
  if (!isOpen || !error) return null;

  const getErrorIcon = () => {
    if (error.statusCode && error.statusCode >= 500) {
      return <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />;
    }
    return <InformationCircleIcon className="w-6 h-6 text-yellow-500" />;
  };

  const getErrorColor = () => {
    if (error.statusCode && error.statusCode >= 500) {
      return 'text-red-600';
    }
    return 'text-yellow-600';
  };

  const formatErrorMessage = (message: string) => {
    // Extract meaningful error message from API responses
    if (message.includes('Configuration validation failed:')) {
      return message.replace('Configuration validation failed:', 'שגיאת הגדרות:');
    }
    if (message.includes('Storage provider test failed:')) {
      return message.replace('Storage provider test failed:', 'שגיאת בדיקת אחסון:');
    }
    if (message.includes('API request failed:')) {
      return message.replace('API request failed:', 'שגיאת בקשה:');
    }
    return message;
  };

  const getErrorSuggestions = () => {
    if (error.message.includes('Local path does not exist')) {
      return [
        'ודא שהנתיב קיים במערכת',
        'בדוק הרשאות גישה לתיקייה',
        'נסה להשתמש בנתיב מלא (absolute path)'
      ];
    }
    if (error.message.includes('Configuration validation failed')) {
      return [
        'בדוק את הגדרות החיבור',
        'ודא שכל השדות הנדרשים מלאים',
        'נסה לבדוק את החיבור שוב'
      ];
    }
    if (error.statusCode && error.statusCode >= 500) {
      return [
        'נסה שוב בעוד מספר דקות',
        'בדוק את חיבור האינטרנט',
        'פנה לתמיכה אם הבעיה נמשכת'
      ];
    }
    return [
      'בדוק את הנתונים שהוזנו',
      'נסה שוב',
      'פנה לתמיכה אם הבעיה נמשכת'
    ];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg rtl-layout">
          {/* Header */}
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                {getErrorIcon()}
                <div>
                  <h3 className={`text-lg font-medium ${getErrorColor()} hebrew-content`}>
                    {title || getUIText('error_occurred')}
                  </h3>
                  {error.statusCode && (
                    <p className="text-sm text-gray-500 hebrew-content">
                      קוד שגיאה: {error.statusCode}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">סגור</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pb-4 pt-0 sm:p-6 sm:pb-4">
            <div className="space-y-4">
              {/* Error Message */}
              <div>
                <p className="text-sm text-gray-900 hebrew-content">
                  {formatErrorMessage(error.message)}
                </p>
              </div>

              {/* Error Details */}
              {(error.details || error.endpoint) && (
                <div className="bg-gray-50 rounded-md p-3">
                  <h4 className="text-sm font-medium text-gray-700 hebrew-content mb-2">
                    פרטים טכניים:
                  </h4>
                  {error.endpoint && (
                    <p className="text-xs text-gray-600 hebrew-content mb-1">
                      <span className="font-medium">Endpoint:</span> {error.endpoint}
                    </p>
                  )}
                  {error.details && (
                    <p className="text-xs text-gray-600 hebrew-content">
                      <span className="font-medium">Details:</span> {error.details}
                    </p>
                  )}
                </div>
              )}

              {/* Suggestions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 hebrew-content mb-2">
                  הצעות לפתרון:
                </h4>
                <ul className="text-sm text-gray-600 hebrew-content space-y-1">
                  {getErrorSuggestions().map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2 space-x-reverse">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timestamp */}
              {error.timestamp && (
                <div className="text-xs text-gray-500 hebrew-content">
                  זמן השגיאה: {new Date(error.timestamp).toLocaleString('he-IL')}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:ml-3 sm:w-auto hebrew-content"
              onClick={onClose}
            >
              הבנתי
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto hebrew-content"
              onClick={() => {
                // Copy error details to clipboard
                const errorText = `Error: ${error.message}\nCode: ${error.code || 'N/A'}\nDetails: ${error.details || 'N/A'}\nTimestamp: ${error.timestamp || new Date().toISOString()}`;
                navigator.clipboard.writeText(errorText);
                // You could add a toast notification here
              }}
            >
              העתק פרטי שגיאה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDialog;
