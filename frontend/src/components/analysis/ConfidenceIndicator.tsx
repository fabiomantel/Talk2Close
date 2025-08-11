import React from 'react';
import { getUIText } from '../../utils/hebrewUtils';

interface ConfidenceIndicatorProps {
  confidence: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ 
  confidence, 
  size = 'medium',
  showLabel = true 
}) => {
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { 
      level: 'high', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      iconColor: 'text-green-500',
      progressColor: 'bg-green-500'
    };
    if (confidence >= 0.6) return { 
      level: 'medium', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      progressColor: 'bg-yellow-500'
    };
    return { 
      level: 'low', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      iconColor: 'text-red-500',
      progressColor: 'bg-red-500'
    };
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return {
          container: 'text-xs',
          icon: 'w-4 h-4',
          progress: 'h-1',
          label: 'text-xs'
        };
      case 'large':
        return {
          container: 'text-lg',
          icon: 'w-6 h-6',
          progress: 'h-3',
          label: 'text-base'
        };
      default: // medium
        return {
          container: 'text-sm',
          icon: 'w-5 h-5',
          progress: 'h-2',
          label: 'text-sm'
        };
    }
  };

  const confidenceInfo = getConfidenceLevel(confidence);
  const sizeClasses = getSizeClasses(size);

  const getConfidenceIcon = () => {
    if (confidence >= 0.8) {
      return (
        <svg className={sizeClasses.icon} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else if (confidence >= 0.6) {
      return (
        <svg className={sizeClasses.icon} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className={sizeClasses.icon} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${sizeClasses.container}`}>
      {/* Confidence Icon */}
      <div className={`${confidenceInfo.iconColor}`}>
        {getConfidenceIcon()}
      </div>

      {/* Confidence Content */}
      <div className="flex-1">
        {showLabel && (
          <div className="flex justify-between items-center mb-1">
            <span className={`font-medium ${confidenceInfo.color}`}>
              {getUIText('confidence')}
            </span>
            <span className={`font-medium ${confidenceInfo.color}`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className={`w-full bg-gray-200 rounded-full ${sizeClasses.progress}`}>
          <div
            className={`rounded-full transition-all duration-300 ${confidenceInfo.progressColor} ${sizeClasses.progress}`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>

        {/* Confidence Level Label */}
        {showLabel && (
          <div className="mt-1">
            <span className={`${confidenceInfo.color} ${confidenceInfo.bgColor} px-2 py-1 rounded-full font-medium ${sizeClasses.label}`}>
              {getUIText(confidenceInfo.level)} {getUIText('confidence')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfidenceIndicator;
