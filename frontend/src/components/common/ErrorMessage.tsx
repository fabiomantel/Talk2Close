import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getUIText } from '../../utils/hebrewUtils';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center h-64 rtl-layout">
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 hebrew-content">{getUIText('error')}</h3>
        <p className="mt-1 text-sm text-gray-500 hebrew-content">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage; 