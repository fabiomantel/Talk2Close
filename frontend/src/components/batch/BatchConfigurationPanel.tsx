import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { CogIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProcessingConfig {
  maxConcurrentFiles: number;
  retryConfig: {
    enabled: boolean;
    maxRetries: number;
    delaySeconds: number;
    exponentialBackoff: boolean;
  };
  autoStart: boolean;
  immediateProcessing: boolean;
  backgroundProcessing: boolean;
}

interface BatchConfigurationPanelProps {
  onConfigurationChange?: (config: ProcessingConfig) => void;
}

const BatchConfigurationPanel: React.FC<BatchConfigurationPanelProps> = ({ onConfigurationChange }) => {
  const [config, setConfig] = useState<ProcessingConfig>({
    maxConcurrentFiles: 5,
    retryConfig: {
      enabled: true,
      maxRetries: 3,
      delaySeconds: 60,
      exponentialBackoff: true
    },
    autoStart: true,
    immediateProcessing: true,
    backgroundProcessing: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Load configuration from API
  const { data: configData, isLoading } = useQuery({
    queryKey: ['batch-config'],
    queryFn: async () => {
      try {
        const response = await apiService.getBatchConfig();
        return response.data;
      } catch (error) {
        console.error('Failed to load batch configuration:', error);
        return null;
      }
    }
  });

  // Save configuration mutation
  const saveMutation = useMutation({
    mutationFn: async (config: ProcessingConfig) => {
      const response = await apiService.updateBatchConfig(config);
      return response;
    },
    onSuccess: (data) => {
      setSuccess('Configuration saved successfully');
      setError(null);
      onConfigurationChange?.(config);
      queryClient.invalidateQueries({ queryKey: ['batch-config'] });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError('Failed to save configuration');
      setSuccess(null);
    }
  });

  // Reset to default mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const defaultConfig: ProcessingConfig = {
        maxConcurrentFiles: 5,
        retryConfig: {
          enabled: true,
          maxRetries: 3,
          delaySeconds: 60,
          exponentialBackoff: true
        },
        autoStart: true,
        immediateProcessing: true,
        backgroundProcessing: true
      };
      
      const response = await apiService.updateBatchConfig(defaultConfig);
      return response;
    },
    onSuccess: (data) => {
      setConfig(data.data);
      setSuccess('Configuration reset to defaults');
      setError(null);
      onConfigurationChange?.(data.data);
      
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError('Failed to reset configuration');
      setSuccess(null);
    }
  });

  useEffect(() => {
    if (configData) {
      setConfig(configData);
    }
  }, [configData]);

  const handleConfigChange = (updates: Partial<ProcessingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleRetryConfigChange = (updates: Partial<ProcessingConfig['retryConfig']>) => {
    setConfig(prev => ({
      ...prev,
      retryConfig: { ...prev.retryConfig, ...updates }
    }));
  };

  const handleSave = () => {
    setSaving(true);
    saveMutation.mutate(config);
    setSaving(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default configuration?')) {
      resetMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Batch Processing Configuration</h2>
          <p className="text-gray-600">Configure global settings for batch processing operations</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 flex items-center"
          >
            <CogIcon className="w-4 h-4 mr-2" />
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <XMarkIcon className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <CheckIcon className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Processing Settings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Settings</h3>
          
          <div className="space-y-4">
            {/* Max Concurrent Files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Concurrent Files
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={config.maxConcurrentFiles}
                  onChange={(e) => handleConfigChange({ maxConcurrentFiles: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {config.maxConcurrentFiles}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Number of files to process simultaneously (1-20)
              </p>
            </div>

            {/* Processing Triggers */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Processing Triggers</label>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoStart"
                  checked={config.autoStart}
                  onChange={(e) => handleConfigChange({ autoStart: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoStart" className="ml-2 text-sm text-gray-700">
                  Auto-start processing when files are discovered
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="immediateProcessing"
                  checked={config.immediateProcessing}
                  onChange={(e) => handleConfigChange({ immediateProcessing: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="immediateProcessing" className="ml-2 text-sm text-gray-700">
                  Process files immediately upon discovery
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="backgroundProcessing"
                  checked={config.backgroundProcessing}
                  onChange={(e) => handleConfigChange({ backgroundProcessing: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="backgroundProcessing" className="ml-2 text-sm text-gray-700">
                  Enable background processing
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Retry Configuration */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Retry Configuration</h3>
          
          <div className="space-y-4">
            {/* Enable Retries */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="retryEnabled"
                checked={config.retryConfig.enabled}
                onChange={(e) => handleRetryConfigChange({ enabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="retryEnabled" className="ml-2 text-sm font-medium text-gray-700">
                Enable automatic retries for failed files
              </label>
            </div>

            {config.retryConfig.enabled && (
              <>
                {/* Max Retries */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Retries
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={config.retryConfig.maxRetries}
                      onChange={(e) => handleRetryConfigChange({ maxRetries: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">
                      {config.retryConfig.maxRetries}
                    </span>
                  </div>
                </div>

                {/* Delay Seconds */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delay Between Retries (seconds)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={config.retryConfig.delaySeconds}
                      onChange={(e) => handleRetryConfigChange({ delaySeconds: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">
                      {config.retryConfig.delaySeconds}s
                    </span>
                  </div>
                </div>

                {/* Exponential Backoff */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="exponentialBackoff"
                    checked={config.retryConfig.exponentialBackoff}
                    onChange={(e) => handleRetryConfigChange({ exponentialBackoff: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="exponentialBackoff" className="ml-2 text-sm text-gray-700">
                    Use exponential backoff (delay increases with each retry)
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Performance Information */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Performance Information</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Processing capacity: ~{config.maxConcurrentFiles * 2} files per minute</p>
          <p>• Memory usage: ~{Math.round(config.maxConcurrentFiles * 200)}MB for concurrent processing</p>
          <p>• Estimated processing time: ~30 seconds per file</p>
          {config.retryConfig.enabled && (
            <p>• Retry attempts: Up to {config.retryConfig.maxRetries} per failed file</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchConfigurationPanel;
