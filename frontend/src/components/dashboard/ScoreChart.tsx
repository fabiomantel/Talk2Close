import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { ScoringAnalytics } from '../../services/api';
import { getCategoryName } from '../../utils/hebrewUtils';

interface ScoreChartProps {
  data: ScoringAnalytics;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ data }) => {
  const chartData = [
    {
      category: getCategoryName('urgency'),
      score: Math.round(data.categoryAverages.urgency),
      fullMark: 100,
    },
    {
      category: getCategoryName('budget'),
      score: Math.round(data.categoryAverages.budget),
      fullMark: 100,
    },
    {
      category: getCategoryName('interest'),
      score: Math.round(data.categoryAverages.interest),
      fullMark: 100,
    },
    {
      category: getCategoryName('engagement'),
      score: Math.round(data.categoryAverages.engagement),
      fullMark: 100,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4 hebrew-content">התפלגות ציונים לפי קטגוריות</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="ציון ממוצע"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-500 hebrew-content">
        ציון כללי ממוצע: {Math.round(data.averageOverallScore)}/100
      </div>
    </div>
  );
};

export default ScoreChart; 