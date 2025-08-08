import React from 'react';
import { getUIText } from '../../utils/hebrewUtils';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 rtl-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center rtl-justify-end">
            <h1 className="text-2xl font-bold text-gray-900 hebrew-content">
              מערכת ניתוח שיחות מכירה בעברית
            </h1>
          </div>
          <div className="flex items-center space-x-4 rtl-space-x-reverse">
            <div className="text-sm text-gray-500 hebrew-content">
              <span className="font-medium">{getUIText('status')}:</span>
              <span className="rtl-ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hebrew-content">
                {getUIText('online')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 