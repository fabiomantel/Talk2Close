import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';

interface ScoringWeights {
  urgency: number;
  budget: number;
  interest: number;
  engagement: number;
}

interface PhraseConfiguration {
  urgency: { high: string[]; medium: string[] };
  budget: { high: string[]; medium: string[] };
  interest: { high: string[]; medium: string[] };
  engagement: { high: string[]; medium: string[] };
}

interface Configuration {
  id?: number;
  name: string;
  weights: ScoringWeights;
  phrases: PhraseConfiguration;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ConfigurationPanelProps {
  onConfigurationChange?: (config: Configuration) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onConfigurationChange }) => {
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadActiveConfiguration = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getConfiguration();
      if (response.success) {
        setConfiguration(response.data);
        onConfigurationChange?.(response.data);
      }
    } catch (err) {
      setError('Failed to load configuration');
      console.error('Configuration load error:', err);
    } finally {
      setLoading(false);
    }
  }, [onConfigurationChange]);

  useEffect(() => {
    loadActiveConfiguration();
  }, [loadActiveConfiguration]);

  const handleWeightChange = (category: keyof ScoringWeights, value: number) => {
    if (!configuration) return;

    const newWeights = { ...configuration.weights, [category]: value };
    const totalWeight = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);

    if (totalWeight > 1.0) {
      setError('Total weights cannot exceed 100%');
      return;
    }

    setConfiguration({ ...configuration, weights: newWeights });
    setError(null);
  };

  const handlePhraseChange = (
    category: keyof PhraseConfiguration,
    level: 'high' | 'medium',
    index: number,
    value: string
  ) => {
    if (!configuration) return;

    const newPhrases = { ...configuration.phrases };
    newPhrases[category][level][index] = value;

    setConfiguration({ ...configuration, phrases: newPhrases });
  };

  const addPhrase = (category: keyof PhraseConfiguration, level: 'high' | 'medium') => {
    if (!configuration) return;

    const newPhrases = { ...configuration.phrases };
    newPhrases[category][level].push('');

    setConfiguration({ ...configuration, phrases: newPhrases });
  };

  const removePhrase = (category: keyof PhraseConfiguration, level: 'high' | 'medium', index: number) => {
    if (!configuration) return;

    const newPhrases = { ...configuration.phrases };
    newPhrases[category][level].splice(index, 1);

    setConfiguration({ ...configuration, phrases: newPhrases });
  };

  const saveConfiguration = async () => {
    if (!configuration) return;

    try {
      setSaving(true);
      setError(null);

      const response = await apiService.createConfiguration({
        name: configuration.name,
        weights: configuration.weights,
        phrases: configuration.phrases,
        isActive: true
      });

      if (response.success) {
        setSuccess('Configuration saved successfully');
        setConfiguration(response.data);
        onConfigurationChange?.(response.data);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to save configuration');
      console.error('Configuration save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    try {
      setSaving(true);
      const response = await apiService.resetConfiguration();
      if (response.success) {
        setConfiguration(response.data.configuration);
        onConfigurationChange?.(response.data.configuration);
        setSuccess('Reset to default configuration');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to reset configuration');
      console.error('Reset error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!configuration) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <p>No configuration available</p>
          <button
            onClick={resetToDefault}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load Default Configuration
          </button>
        </div>
      </div>
    );
  }

  const totalWeight = Object.values(configuration.weights).reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Scoring Configuration</h2>
        <div className="flex space-x-2">
          <button
            onClick={resetToDefault}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Reset to Default
          </button>
          <button
            onClick={saveConfiguration}
            disabled={saving || totalWeight !== 1.0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Configuration Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Configuration Name
        </label>
        <input
          type="text"
          value={configuration.name}
          onChange={(e) => setConfiguration({ ...configuration, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter configuration name"
        />
      </div>

      {/* Scoring Weights */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scoring Weights</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(configuration.weights).map(([category, weight]) => (
            <div key={category} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {category} Weight
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weight}
                  onChange={(e) => handleWeightChange(category as keyof ScoringWeights, parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {Math.round(weight * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <span className="text-sm font-medium">
            Total Weight: {Math.round(totalWeight * 100)}%
            {totalWeight !== 1.0 && (
              <span className="text-red-600 ml-2">
                (Must equal 100%)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Hebrew Phrases */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hebrew Phrases</h3>
        <div className="space-y-6">
          {Object.entries(configuration.phrases).map(([category, levels]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 capitalize mb-3">
                {category} Phrases
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(levels).map(([level, phrases]) => (
                  <div key={level}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {level} Priority
                      </label>
                      <button
                        onClick={() => addPhrase(category as keyof PhraseConfiguration, level as 'high' | 'medium')}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Add Phrase
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(phrases as string[]).map((phrase: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={phrase}
                            onChange={(e) => handlePhraseChange(
                              category as keyof PhraseConfiguration,
                              level as 'high' | 'medium',
                              index,
                              e.target.value
                            )}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter Hebrew phrase"
                            dir="rtl"
                          />
                          <button
                            onClick={() => removePhrase(
                              category as keyof PhraseConfiguration,
                              level as 'high' | 'medium',
                              index
                            )}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
