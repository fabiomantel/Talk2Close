import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { getUIText } from '../../utils/hebrewUtils';
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
      setSuccess(getUIText('configuration_saved_successfully'));
      setError(null);
      onConfigurationChange?.(config);
      queryClient.invalidateQueries({ queryKey: ['batch-config'] });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError(getUIText('failed_to_save_configuration'));
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
      setSuccess(getUIText('configuration_reset_to_defaults'));
      setError(null);
      onConfigurationChange?.(data.data);
      
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError(getUIText('failed_to_reset_configuration'));
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
    if (window.confirm(getUIText('are_you_sure_reset'))) {
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
    <div className="space-y-6 rtl-layout">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 hebrew-content">{getUIText('batch_processing_configuration')}</h2>
          <p className="text-gray-600 hebrew-content">{getUIText('batch_config_description')}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 flex items-center"
          >
            <CogIcon className="w-4 h-4 mr-2" />
            {getUIText('reset_to_default')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {getUIText('saving')}
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                {getUIText('save_configuration')}
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
            <p className="text-red-800 hebrew-content">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <CheckIcon className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-green-800 hebrew-content">{success}</p>
          </div>
        </div>
      )}

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Processing Settings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 hebrew-content">{getUIText('processing_settings')}</h3>
          
          <div className="space-y-4">
            {/* Max Concurrent Files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                {getUIText('max_concurrent_files')}
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
              <p className="text-xs text-gray-500 mt-1 hebrew-content">
                {getUIText('max_concurrent_files_help')}
              </p>
            </div>

            {/* Processing Triggers */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 hebrew-content">{getUIText('processing_triggers')}</label>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoStart"
                  checked={config.autoStart}
                  onChange={(e) => handleConfigChange({ autoStart: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoStart" className="ml-2 text-sm text-gray-700 hebrew-content">
                  {getUIText('auto_start_processing')}
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
                <label htmlFor="immediateProcessing" className="ml-2 text-sm text-gray-700 hebrew-content">
                  {getUIText('process_files_immediately')}
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
                <label htmlFor="backgroundProcessing" className="ml-2 text-sm text-gray-700 hebrew-content">
                  {getUIText('enable_background_processing')}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Retry Configuration */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 hebrew-content">{getUIText('retry_configuration')}</h3>
          
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
              <label htmlFor="retryEnabled" className="ml-2 text-sm font-medium text-gray-700 hebrew-content">
                {getUIText('enable_automatic_retries')}
              </label>
            </div>

            {config.retryConfig.enabled && (
              <>
                {/* Max Retries */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                    {getUIText('max_retries')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                    {getUIText('delay_between_retries')}
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
                  <label htmlFor="exponentialBackoff" className="ml-2 text-sm text-gray-700 hebrew-content">
                    {getUIText('use_exponential_backoff')}
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Performance Information */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2 hebrew-content">{getUIText('performance_information')}</h4>
        <div className="text-sm text-blue-800 space-y-1 hebrew-content">
          <p>• {getUIText('processing_capacity')}: ~{config.maxConcurrentFiles * 2} {getUIText('files_per_minute')}</p>
          <p>• {getUIText('memory_usage')}: ~{Math.round(config.maxConcurrentFiles * 200)}MB {getUIText('for_concurrent_processing')}</p>
          <p>• {getUIText('estimated_processing_time')}: ~30 {getUIText('seconds_per_file')}</p>
          {config.retryConfig.enabled && (
            <p>• {getUIText('retry_attempts')}: {getUIText('per_failed_file')} {config.retryConfig.maxRetries}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchConfigurationPanel;
