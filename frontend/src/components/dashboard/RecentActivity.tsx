import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { formatHebrewDate, getUIText } from '../../utils/hebrewUtils';

const RecentActivity: React.FC = () => {
  const { data: analysesData } = useQuery({
    queryKey: ['analyses'],
    queryFn: apiService.getAllAnalyses,
  });

  const recentAnalyses = analysesData?.data.analyses.slice(0, 5) || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4 hebrew-content">{getUIText('recent_activity')}</h3>
      <div className="space-y-4">
        {recentAnalyses.length > 0 ? (
          recentAnalyses.map((analysis) => (
            <div key={analysis.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {analysis.customer.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 hebrew-content">
                  {analysis.customer.name}
                </p>
                <p className="text-sm text-gray-500 hebrew-content">
                  {analysis.overallScore ? `ציון: ${analysis.overallScore}/100` : 'ממתין לניתוח'}
                </p>
              </div>
              <div className="text-sm text-gray-500 hebrew-content">
                {formatHebrewDate(analysis.createdAt)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 hebrew-content">{getUIText('no_recent_activity')}</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivity; 