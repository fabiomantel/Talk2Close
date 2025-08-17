import React from 'react';
import { getUIText } from '../utils/hebrewUtils';

const BatchProcessing: React.FC = () => {
  return (
    <div className="space-y-6 rtl-layout">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 hebrew-content">
          {getUIText('batch_settings')}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 hebrew-content">
          הגדרות עיבוד מאוחד יתווספו כאן בקרוב
        </p>
      </div>
    </div>
  );
};

export default BatchProcessing;