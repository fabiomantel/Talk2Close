import React from 'react';

interface HebrewInsightsProps {
  notes: string;
}

const HebrewInsights: React.FC<HebrewInsightsProps> = ({ notes }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Hebrew Analysis Insights</h4>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="hebrew-insights text-sm text-blue-900">
          {notes}
        </div>
      </div>
    </div>
  );
};

export default HebrewInsights; 