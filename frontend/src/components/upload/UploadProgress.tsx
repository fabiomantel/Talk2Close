import React from 'react';
import { getUIText } from '../../utils/hebrewUtils';

const UploadProgress: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <div className="ml-3">
          <p className="text-sm font-medium text-blue-800 hebrew-content">
            {getUIText('upload_progress')}
          </p>
          <p className="text-xs text-blue-600 hebrew-content">
            זה עשוי לקחת מספר דקות בהתאם לגודל הקובץ
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadProgress; 