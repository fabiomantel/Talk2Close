import React from 'react';
import { useErrorDialog } from '../../hooks/useErrorDialog';
import ErrorDialog from './ErrorDialog';
import { getUIText } from '../../utils/hebrewUtils';

const ErrorDialogDemo: React.FC = () => {
  const { error, isOpen, showError, hideError } = useErrorDialog();

  const testErrors = [
    {
      name: 'Configuration Error',
      error: {
        message: 'Configuration validation failed: Local path does not exist: tmp/recordings/',
        statusCode: 500,
        endpoint: '/api/batch-config/folders',
        details: 'The specified local path does not exist on the server. Please check the path and ensure it exists.'
      }
    },
    {
      name: 'Network Error',
      error: {
        message: 'Network error: Failed to fetch',
        statusCode: 0,
        endpoint: '/api/upload',
        details: 'Unable to connect to the server. Please check your internet connection.'
      }
    },
    {
      name: 'Validation Error',
      error: {
        message: 'Validation failed: Invalid email format',
        statusCode: 400,
        endpoint: '/api/customers',
        details: 'The provided email address is not in a valid format.'
      }
    },
    {
      name: 'Permission Error',
      error: {
        message: 'Access denied: Insufficient permissions',
        statusCode: 403,
        endpoint: '/api/admin/users',
        details: 'You do not have sufficient permissions to access this resource.'
      }
    },
    {
      name: 'Server Error',
      error: {
        message: 'Internal server error: Database connection failed',
        statusCode: 500,
        endpoint: '/api/analysis',
        details: 'The server encountered an internal error while processing your request.'
      }
    },
    {
      name: 'Simple String Error',
      error: 'This is a simple string error message'
    }
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Error Dialog Demo</h2>
        <p className="text-blue-800 text-sm">
          Click the buttons below to test different types of error dialogs. This demonstrates how the error dialog 
          handles various error scenarios with different levels of detail.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testErrors.map((testError, index) => (
          <button
            key={index}
            onClick={() => showError(testError.error)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-medium text-gray-900 mb-1">{testError.name}</h3>
            <p className="text-sm text-gray-600">
              {typeof testError.error === 'string' 
                ? testError.error 
                : testError.error.message
              }
            </p>
          </button>
        ))}
      </div>

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={isOpen}
        onClose={hideError}
        error={error}
        title={getUIText('error_occurred')}
      />
    </div>
  );
};

export default ErrorDialogDemo;
