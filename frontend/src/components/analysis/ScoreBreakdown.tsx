import React from 'react';
import { getScoreColor, getScoreLabel, getCategoryName, getUIText } from '../../utils/hebrewUtils';

interface Scores {
  urgency: number;
  budget: number;
  interest: number;
  engagement: number;
  overall: number;
}

interface ScoreBreakdownProps {
  scores: Scores;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ scores }) => {
  const categories = [
    { name: 'urgency', score: scores.urgency, weight: 0.30 },
    { name: 'budget', score: scores.budget, weight: 0.25 },
    { name: 'interest', score: scores.interest, weight: 0.25 },
    { name: 'engagement', score: scores.engagement, weight: 0.20 },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900 hebrew-content">{getUIText('score_breakdown')}</h4>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-center mb-4">
          <div className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>
            {scores.overall}/100
          </div>
          <div className="text-sm text-gray-600 hebrew-content">{getScoreLabel(scores.overall)}</div>
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 hebrew-content">{getCategoryName(category.name)}</span>
                <span className="text-xs text-gray-500">({(category.weight * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreColor(category.score).replace('text-', 'bg-').replace('bg-green-600', 'bg-green-500').replace('bg-blue-600', 'bg-blue-500').replace('bg-yellow-600', 'bg-yellow-500').replace('bg-red-600', 'bg-red-500')}`}
                    style={{ width: `${category.score}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${getScoreColor(category.score)}`}>
                  {category.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown; 