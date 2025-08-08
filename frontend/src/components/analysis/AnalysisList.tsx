import React from 'react';
import { SalesCall } from '../../services/api';
import { formatHebrewDate, getScoreColor, getScoreLabel, getUIText } from '../../utils/hebrewUtils';

interface AnalysisListProps {
  analyses: SalesCall[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const AnalysisList: React.FC<AnalysisListProps> = ({
  analyses,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 hebrew-content">{getUIText('recent_analyses')}</h3>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {analyses.length > 0 ? (
          analyses.map((analysis) => (
            <div
              key={analysis.id}
              onClick={() => onSelect(analysis.id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedId === analysis.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 hebrew-content">
                    {analysis.customer.name}
                  </h4>
                  <p className="text-xs text-gray-500 hebrew-content">{analysis.customer.phone}</p>
                  <p className="text-xs text-gray-400 mt-1 hebrew-content">
                    {formatHebrewDate(analysis.createdAt)}
                  </p>
                </div>
                {analysis.overallScore && (
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(analysis.overallScore)}`}>
                      {analysis.overallScore}/100
                    </div>
                    <p className="text-xs text-gray-500 mt-1 hebrew-content">
                      {getScoreLabel(analysis.overallScore)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 hebrew-content">
            {getUIText('no_analyses')}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisList; 