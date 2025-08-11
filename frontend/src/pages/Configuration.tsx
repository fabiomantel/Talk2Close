import React from 'react';
import ConfigurationPanel from '../components/configuration/ConfigurationPanel';
import { getUIText } from '../utils/hebrewUtils';

const Configuration: React.FC = () => {
  const handleConfigurationChange = (config: any) => {
    console.log('Configuration updated:', config);
    // Here you could trigger a global state update or API call
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 hebrew-content">
            {getUIText('configuration')}
          </h1>
          <p className="mt-2 text-gray-600 hebrew-content">
            {getUIText('configurationDescription')}
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-6">
          <ConfigurationPanel onConfigurationChange={handleConfigurationChange} />
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4 hebrew-content">
            {getUIText('configurationHelp')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2 hebrew-content">{getUIText('scoringWeights')}</h4>
              <ul className="space-y-1 hebrew-content">
                <li>• {getUIText('urgencyWeightHelp')}</li>
                <li>• {getUIText('budgetWeightHelp')}</li>
                <li>• {getUIText('interestWeightHelp')}</li>
                <li>• {getUIText('engagementWeightHelp')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 hebrew-content">{getUIText('hebrewPhrases')}</h4>
              <ul className="space-y-1 hebrew-content">
                <li>• {getUIText('phraseHelp1')}</li>
                <li>• {getUIText('phraseHelp2')}</li>
                <li>• {getUIText('phraseHelp3')}</li>
                <li>• {getUIText('phraseHelp4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
