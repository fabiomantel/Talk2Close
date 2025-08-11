import React from 'react';
import { getUIText } from '../../utils/hebrewUtils';

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

interface SpeakerAnalysisBreakdownProps {
  analysis: SpeakerAnalysis;
}

const SpeakerAnalysisBreakdown: React.FC<SpeakerAnalysisBreakdownProps> = ({ analysis }) => {
  const getEngagementLevel = (score: number) => {
    if (score >= 0.8) return { level: 'high', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 0.6) return { level: 'medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'low', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getEffectivenessLevel = (score: number) => {
    if (score >= 0.8) return { level: 'excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 0.6) return { level: 'good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 0.4) return { level: 'fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const customerEngagement = getEngagementLevel(analysis.customer.engagement);
  const agentEffectiveness = getEffectivenessLevel(analysis.agent.effectiveness);

  return (
    <div className="space-y-6">
      {/* Customer Analysis */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
          <h5 className="text-lg font-medium text-gray-900">{getUIText('customerAnalysis')}</h5>
        </div>

        {/* Customer Engagement */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{getUIText('engagementLevel')}</span>
            <span className={`text-sm font-medium ${customerEngagement.color}`}>
              {Math.round(analysis.customer.engagement * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                customerEngagement.level === 'high' ? 'bg-green-500' :
                customerEngagement.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${analysis.customer.engagement * 100}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${customerEngagement.color} ${customerEngagement.bgColor} px-2 py-1 rounded-full`}>
            {getUIText(customerEngagement.level)} {getUIText('engagement')}
          </span>
        </div>

        {/* Customer Objections */}
        {analysis.customer.objections && analysis.customer.objections.length > 0 && (
          <div className="mb-4">
            <h6 className="text-sm font-medium text-gray-900 mb-2">{getUIText('customerObjections')}</h6>
            <div className="space-y-2">
              {analysis.customer.objections.map((objection, index) => (
                <div key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                  <span className="text-sm text-gray-700">{objection}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buying Signals */}
        {analysis.customer.buyingSignals && analysis.customer.buyingSignals.length > 0 && (
          <div>
            <h6 className="text-sm font-medium text-gray-900 mb-2">{getUIText('buyingSignals')}</h6>
            <div className="space-y-2">
              {analysis.customer.buyingSignals.map((signal, index) => (
                <div key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                  <span className="text-sm text-gray-700">{signal}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Agent Analysis */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white mr-3">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
          <h5 className="text-lg font-medium text-gray-900">{getUIText('agentAnalysis')}</h5>
        </div>

        {/* Agent Effectiveness */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{getUIText('effectivenessLevel')}</span>
            <span className={`text-sm font-medium ${agentEffectiveness.color}`}>
              {Math.round(analysis.agent.effectiveness * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                agentEffectiveness.level === 'excellent' ? 'bg-green-500' :
                agentEffectiveness.level === 'good' ? 'bg-blue-500' :
                agentEffectiveness.level === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${analysis.agent.effectiveness * 100}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${agentEffectiveness.color} ${agentEffectiveness.bgColor} px-2 py-1 rounded-full`}>
            {getUIText(agentEffectiveness.level)} {getUIText('effectiveness')}
          </span>
        </div>

        {/* Effective Techniques */}
        {analysis.agent.techniques && analysis.agent.techniques.length > 0 && (
          <div className="mb-4">
            <h6 className="text-sm font-medium text-gray-900 mb-2">{getUIText('effectiveTechniques')}</h6>
            <div className="space-y-2">
              {analysis.agent.techniques.map((technique, index) => (
                <div key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                  <span className="text-sm text-gray-700">{technique}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas for Improvement */}
        {analysis.agent.areas && analysis.agent.areas.length > 0 && (
          <div>
            <h6 className="text-sm font-medium text-gray-900 mb-2">{getUIText('areasForImprovement')}</h6>
            <div className="space-y-2">
              {analysis.agent.areas.map((area, index) => (
                <div key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></span>
                  <span className="text-sm text-gray-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interaction Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h6 className="text-sm font-medium text-gray-900 mb-3">{getUIText('interactionSummary')}</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{getUIText('customerEngagement')}:</span>
            <span className={`ml-1 font-medium ${customerEngagement.color}`}>
              {Math.round(analysis.customer.engagement * 100)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500">{getUIText('agentEffectiveness')}:</span>
            <span className={`ml-1 font-medium ${agentEffectiveness.color}`}>
              {Math.round(analysis.agent.effectiveness * 100)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500">{getUIText('objectionsRaised')}:</span>
            <span className="ml-1 font-medium">{analysis.customer.objections?.length || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">{getUIText('buyingSignals')}:</span>
            <span className="ml-1 font-medium">{analysis.customer.buyingSignals?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakerAnalysisBreakdown;
