import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import AnalysisList from '../components/analysis/AnalysisList';
import AnalysisDetails from '../components/analysis/AnalysisDetails';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getUIText } from '../utils/hebrewUtils';

const Analysis: React.FC = () => {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);

  const {
    data: analysesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['analyses'],
    queryFn: apiService.getAllAnalyses,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load analyses" />;
  }

  const analyses = analysesData?.data.analyses || [];

  return (
    <div className="space-y-6 rtl-layout">
      <div className="flex justify-between items-center rtl-flex-row-reverse">
        <h1 className="text-3xl font-bold text-gray-900 hebrew-content">{getUIText('analysis_results')}</h1>
        <div className="text-sm text-gray-500 hebrew-content">
          {analyses.length} ניתוחים סה"כ
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalysisList
          analyses={analyses}
          selectedId={selectedAnalysisId}
          onSelect={setSelectedAnalysisId}
        />
        {selectedAnalysisId && (
          <AnalysisDetails analysisId={selectedAnalysisId} />
        )}
      </div>
    </div>
  );
};

export default Analysis; 