import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import ScoreBreakdown from './ScoreBreakdown';
import HebrewInsights from './HebrewInsights';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

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
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Analysis Details
        </h3>
        <div className="text-sm text-gray-500">
          Customer: {analysis.customer.name}
        </div>
      </div>

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

      {analysis.analysisNotes && (
        <HebrewInsights notes={analysis.analysisNotes} />
      )}

      {analysis.transcript && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Transcript</h4>
          <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 hebrew-content">
            {analysis.transcript}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDetails; 