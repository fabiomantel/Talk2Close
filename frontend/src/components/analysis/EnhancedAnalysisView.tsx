import React from 'react';
import SentimentVisualization from './SentimentVisualization';
import ConversationFlowTimeline from './ConversationFlowTimeline';
import SpeakerAnalysisBreakdown from './SpeakerAnalysisBreakdown';
import ConfidenceIndicator from './ConfidenceIndicator';
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

interface ConversationPhase {
  name: string;
  startTime: number;
  endTime: number;
  description: string;
  keyEvents: string[];
}

interface SpeakerAnalysis {
  customer: {
    engagement: number;
    objections: string[];
    buyingSignals: string[];
  };
  agent: {
    effectiveness: number;
    techniques: string[];
    areas: string[];
  };
}

interface ObjectionAnalysis {
  objections: Array<{
    type: string;
    strength: 'low' | 'medium' | 'high';
    description: string;
    response?: string;
  }>;
}

interface ContextInsights {
  keyInsights: string[];
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
}

interface EnhancedAnalysisData {
  version: string;
  gpt4Used: boolean;
  confidence: number;
  sentiment: SentimentAnalysis;
  conversationFlow: {
    phases: ConversationPhase[];
    totalDuration: number;
  };
  speakerAnalysis: SpeakerAnalysis;
  objectionAnalysis: ObjectionAnalysis;
  contextInsights: ContextInsights;
}

interface EnhancedAnalysisViewProps {
  enhancedAnalysis: EnhancedAnalysisData;
  className?: string;
}

const EnhancedAnalysisView: React.FC<EnhancedAnalysisViewProps> = ({ 
  enhancedAnalysis, 
  className = '' 
}) => {
  if (!enhancedAnalysis || !enhancedAnalysis.gpt4Used) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              {getUIText('enhancedAnalysisNotAvailable')}
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>{getUIText('enhancedAnalysisNotAvailableDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with confidence indicator */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {getUIText('enhancedAnalysis')}
          </h3>
          <p className="text-sm text-gray-500">
            {getUIText('analysisVersion')}: {enhancedAnalysis.version}
          </p>
        </div>
        <ConfidenceIndicator confidence={enhancedAnalysis.confidence} />
      </div>

      {/* Sentiment Analysis */}
      {enhancedAnalysis.sentiment && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {getUIText('sentimentAnalysis')}
          </h4>
          <SentimentVisualization sentiment={enhancedAnalysis.sentiment} />
        </div>
      )}

      {/* Conversation Flow Timeline */}
      {enhancedAnalysis.conversationFlow && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {getUIText('conversationFlow')}
          </h4>
          <ConversationFlowTimeline 
            phases={enhancedAnalysis.conversationFlow.phases}
            totalDuration={enhancedAnalysis.conversationFlow.totalDuration}
          />
        </div>
      )}

      {/* Speaker Analysis */}
      {enhancedAnalysis.speakerAnalysis && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {getUIText('speakerAnalysis')}
          </h4>
          <SpeakerAnalysisBreakdown analysis={enhancedAnalysis.speakerAnalysis} />
        </div>
      )}

      {/* Objection Analysis */}
      {enhancedAnalysis.objectionAnalysis && enhancedAnalysis.objectionAnalysis.objections.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {getUIText('objectionAnalysis')}
          </h4>
          <div className="space-y-4">
            {enhancedAnalysis.objectionAnalysis.objections.map((objection, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{objection.type}</h5>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    objection.strength === 'high' ? 'bg-red-100 text-red-800' :
                    objection.strength === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {objection.strength} {getUIText('strength')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{objection.description}</p>
                {objection.response && (
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>{getUIText('suggestedResponse')}:</strong> {objection.response}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context Insights */}
      {enhancedAnalysis.contextInsights && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {getUIText('contextInsights')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Insights */}
            {enhancedAnalysis.contextInsights.keyInsights.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">{getUIText('keyInsights')}</h5>
                <ul className="space-y-2">
                  {enhancedAnalysis.contextInsights.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                      <span className="text-sm text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {enhancedAnalysis.contextInsights.recommendations.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">{getUIText('recommendations')}</h5>
                <ul className="space-y-2">
                  {enhancedAnalysis.contextInsights.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Factors */}
            {enhancedAnalysis.contextInsights.riskFactors.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">{getUIText('riskFactors')}</h5>
                <ul className="space-y-2">
                  {enhancedAnalysis.contextInsights.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                      <span className="text-sm text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunities */}
            {enhancedAnalysis.contextInsights.opportunities.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">{getUIText('opportunities')}</h5>
                <ul className="space-y-2">
                  {enhancedAnalysis.contextInsights.opportunities.map((opp, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                      <span className="text-sm text-gray-700">{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAnalysisView;
