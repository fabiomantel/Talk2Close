import React from 'react';
import { getUIText } from '../../utils/hebrewUtils';

interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  confidence: number;
  changes?: Array<{
    phase: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }>;
}

interface SentimentVisualizationProps {
  sentiment: SentimentAnalysis;
}

const SentimentVisualization: React.FC<SentimentVisualizationProps> = ({ sentiment }) => {
  const getSentimentColor = (sentimentType: string) => {
    switch (sentimentType) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      case 'neutral':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentimentType: string) => {
    switch (sentimentType) {
      case 'positive':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        );
      case 'negative':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'neutral':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { level: 'high', color: 'text-green-600' };
    if (confidence >= 0.6) return { level: 'medium', color: 'text-yellow-600' };
    return { level: 'low', color: 'text-red-600' };
  };

  const confidenceInfo = getConfidenceLevel(sentiment.confidence);

  return (
    <div className="space-y-4">
      {/* Overall Sentiment */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getSentimentColor(sentiment.overall)}`}>
            {getSentimentIcon(sentiment.overall)}
          </div>
          <div>
            <h5 className="font-medium text-gray-900 capitalize">
              {getUIText('overallSentiment')}: {sentiment.overall}
            </h5>
            <p className="text-sm text-gray-500">
              {getUIText('confidence')}: {Math.round(sentiment.confidence * 100)}%
            </p>
          </div>
        </div>
        <div className={`text-sm font-medium ${confidenceInfo.color}`}>
          {getUIText(confidenceInfo.level)} {getUIText('confidence')}
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            confidenceInfo.level === 'high' ? 'bg-green-500' :
            confidenceInfo.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${sentiment.confidence * 100}%` }}
        />
      </div>

      {/* Sentiment Changes Over Time */}
      {sentiment.changes && sentiment.changes.length > 0 && (
        <div>
          <h6 className="text-sm font-medium text-gray-900 mb-3">
            {getUIText('sentimentChanges')}
          </h6>
          <div className="space-y-2">
            {sentiment.changes.map((change, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded-full ${getSentimentColor(change.sentiment)}`}>
                    {getSentimentIcon(change.sentiment)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{change.phase}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(change.confidence * 100)}% {getUIText('confidence')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sentiment Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h6 className="text-sm font-medium text-blue-900 mb-2">
          {getUIText('sentimentSummary')}
        </h6>
        <p className="text-sm text-blue-800">
          {sentiment.overall === 'positive' && getUIText('positiveSentimentSummary')}
          {sentiment.overall === 'negative' && getUIText('negativeSentimentSummary')}
          {sentiment.overall === 'neutral' && getUIText('neutralSentimentSummary')}
        </p>
      </div>
    </div>
  );
};

export default SentimentVisualization;
