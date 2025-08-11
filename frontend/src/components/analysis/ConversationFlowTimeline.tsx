import React from 'react';
import { getUIText } from '../../utils/hebrewUtils';

interface ConversationPhase {
  name: string;
  startTime: number;
  endTime: number;
  description: string;
  keyEvents: string[];
}

interface ConversationFlowTimelineProps {
  phases: ConversationPhase[];
  totalDuration: number;
}

const ConversationFlowTimeline: React.FC<ConversationFlowTimelineProps> = ({ 
  phases, 
  totalDuration 
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (phaseName: string) => {
    const phaseColors: { [key: string]: string } = {
      'introduction': 'bg-blue-500',
      'needs_assessment': 'bg-green-500',
      'presentation': 'bg-purple-500',
      'objection_handling': 'bg-yellow-500',
      'closing': 'bg-red-500',
      'follow_up': 'bg-indigo-500'
    };
    return phaseColors[phaseName.toLowerCase()] || 'bg-gray-500';
  };

  const getPhaseIcon = (phaseName: string) => {
    const phaseIcons: { [key: string]: React.JSX.Element } = {
      'introduction': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
        </svg>
      ),
      'needs_assessment': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      'presentation': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" />
          <path d="M8 11a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V14a3 3 0 013-3h6a3 3 0 013 3v1.5a1.5 1.5 0 01-3 0V14a3 3 0 00-3-3H8z" />
        </svg>
      ),
      'objection_handling': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      'closing': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      'follow_up': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    };
    return phaseIcons[phaseName.toLowerCase()] || (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex justify-between items-center">
        <div>
          <h5 className="font-medium text-gray-900">{getUIText('conversationPhases')}</h5>
          <p className="text-sm text-gray-500">
            {getUIText('totalDuration')}: {formatTime(totalDuration)}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {phases.length} {getUIText('phases')}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Phases */}
        <div className="space-y-6">
          {phases.map((phase, index) => {
            const phaseDuration = phase.endTime - phase.startTime;
            const phasePercentage = (phaseDuration / totalDuration) * 100;
            
            return (
              <div key={index} className="relative flex items-start">
                {/* Phase Dot */}
                <div className={`absolute left-4 w-4 h-4 rounded-full ${getPhaseColor(phase.name)} flex items-center justify-center text-white z-10`}>
                  {getPhaseIcon(phase.name)}
                </div>

                {/* Phase Content */}
                <div className="ml-12 flex-1">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* Phase Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h6 className="font-medium text-gray-900 capitalize">
                          {phase.name.replace('_', ' ')}
                        </h6>
                        <p className="text-sm text-gray-500">
                          {formatTime(phase.startTime)} - {formatTime(phase.endTime)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(phasePercentage)}% {getUIText('ofConversation')}
                      </div>
                    </div>

                    {/* Phase Description */}
                    <p className="text-sm text-gray-700 mb-3">{phase.description}</p>

                    {/* Phase Duration Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full ${getPhaseColor(phase.name)}`}
                        style={{ width: `${phasePercentage}%` }}
                      />
                    </div>

                    {/* Key Events */}
                    {phase.keyEvents && phase.keyEvents.length > 0 && (
                      <div>
                        <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                          {getUIText('keyEvents')}
                        </h6>
                        <ul className="mt-2 space-y-1">
                          {phase.keyEvents.map((event, eventIndex) => (
                            <li key={eventIndex} className="flex items-start">
                              <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2"></span>
                              <span className="text-xs text-gray-600">{event}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversation Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h6 className="text-sm font-medium text-gray-900 mb-2">
          {getUIText('conversationSummary')}
        </h6>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{getUIText('totalPhases')}:</span>
            <span className="ml-1 font-medium">{phases.length}</span>
          </div>
          <div>
            <span className="text-gray-500">{getUIText('totalDuration')}:</span>
            <span className="ml-1 font-medium">{formatTime(totalDuration)}</span>
          </div>
          <div>
            <span className="text-gray-500">{getUIText('avgPhaseDuration')}:</span>
            <span className="ml-1 font-medium">
              {formatTime(totalDuration / phases.length)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">{getUIText('totalEvents')}:</span>
            <span className="ml-1 font-medium">
              {phases.reduce((total, phase) => total + (phase.keyEvents?.length || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationFlowTimeline;
