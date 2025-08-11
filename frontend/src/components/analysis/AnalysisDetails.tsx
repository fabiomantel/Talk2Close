import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import ScoreBreakdown from './ScoreBreakdown';
import HebrewInsights from './HebrewInsights';
import EnhancedAnalysisView from './EnhancedAnalysisView';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import AudioPlayer from '../common/AudioPlayer';
import { getUIText } from '../../utils/hebrewUtils';

interface AnalysisDetailsProps {
  analysisId: number;
}

const AnalysisDetails: React.FC<AnalysisDetailsProps> = ({ analysisId }) => {
  const {
    data: analysisData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: () => apiService.getAnalysis(analysisId),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load analysis details" />;
  }

  const analysis = analysisData?.data;

  if (!analysis) {
    return <ErrorMessage message="Analysis not found" />;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6 rtl-card">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2 hebrew-content">
          {getUIText('details')}
        </h3>
        <div className="text-sm text-gray-500 hebrew-content">
          לקוח: {analysis.customer.name}
        </div>
      </div>

      {/* Audio Player Section */}
      {analysis.audioFilePath && (
        <AudioPlayer 
          salesCallId={analysis.id}
          onPlaybackStart={() => console.log('Audio playback started for analysis:', analysis.id)}
          onPlaybackEnd={() => console.log('Audio playback ended for analysis:', analysis.id)}
          onError={(error) => console.error('Audio error for analysis:', analysis.id, error)}
        />
      )}

      {analysis.overallScore && (
        <ScoreBreakdown
          scores={{
            urgency: analysis.urgencyScore || 0,
            budget: analysis.budgetScore || 0,
            interest: analysis.interestScore || 0,
            engagement: analysis.engagementScore || 0,
            overall: analysis.overallScore,
          }}
        />
      )}

      {/* Enhanced Analysis View */}
      {analysis.gpt4AnalysisUsed && (
        <EnhancedAnalysisView
          enhancedAnalysis={{
            version: analysis.analysisVersion || 'unknown',
            gpt4Used: analysis.gpt4AnalysisUsed,
            confidence: analysis.analysisConfidence || 0,
            sentiment: analysis.sentimentScore ? {
              overall: analysis.sentimentScore > 0.6 ? 'positive' : analysis.sentimentScore < 0.4 ? 'negative' : 'neutral',
              confidence: analysis.sentimentScore
            } : {
              overall: 'neutral' as const,
              confidence: 0
            },
            conversationFlow: analysis.conversationPhases ? {
              phases: analysis.conversationPhases.phases || [],
              totalDuration: analysis.conversationPhases.totalDuration || 0
            } : {
              phases: [],
              totalDuration: 0
            },
            speakerAnalysis: analysis.speakerAnalysis || {
              customer: { engagement: 0, objections: [], buyingSignals: [] },
              agent: { effectiveness: 0, techniques: [], areas: [] }
            },
            objectionAnalysis: analysis.objectionAnalysis || { objections: [] },
            contextInsights: analysis.contextInsights || {
              keyInsights: [],
              recommendations: [],
              riskFactors: [],
              opportunities: []
            }
          }}
        />
      )}

      {/* Traditional Analysis Notes */}
      {analysis.analysisNotes && (
        <HebrewInsights notes={analysis.analysisNotes} />
      )}

      {analysis.transcript && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 hebrew-content">{getUIText('transcript')}</h4>
          <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 hebrew-content">
            {analysis.transcript}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDetails; 