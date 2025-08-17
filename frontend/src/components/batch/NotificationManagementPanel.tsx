import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { 
  BellIcon, 
  PlusIcon, 
  TrashIcon, 
  CogIcon, 
  CheckIcon, 
  XMarkIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface NotificationConfig {
  id?: number;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  name: string;
  config: any;
  conditions: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface NotificationManagementPanelProps {
  onNotificationChange?: (config: NotificationConfig) => void;
}

const NotificationManagementPanel: React.FC<NotificationManagementPanelProps> = ({ onNotificationChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<NotificationConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Load notification configurations
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['batch-notifications'],
    queryFn: async () => {
      try {
        const response = await apiService.getBatchNotificationConfigs();
        return response.data?.notifications || [];
      } catch (error) {
        console.error('Failed to load notification configurations:', error);
        return [];
      }
    }
  });

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (config: Omit<NotificationConfig, 'id'>) => {
      const response = await apiService.createBatchNotificationConfig(config);
      return response;
    },
    onSuccess: (data) => {
      setSuccess('Notification configuration created successfully');
      setError(null);
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ['batch-notifications'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError('Failed to create notification configuration');
      setSuccess(null);
    }
  });

  // Update notification mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, config }: { id: number; config: Partial<NotificationConfig> }) => {
      const response = await apiService.updateBatchNotificationConfig(id, config);
      return response;
    },
    onSuccess: (data) => {
      setSuccess('Notification configuration updated successfully');
      setError(null);
      setEditingConfig(null);
      queryClient.invalidateQueries({ queryKey: ['batch-notifications'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError('Failed to update notification configuration');
      setSuccess(null);
    }
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.deleteBatchNotificationConfig(id);
      return response;
    },
    onSuccess: (data) => {
      setSuccess('Notification configuration deleted successfully');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['batch-notifications'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError('Failed to delete notification configuration');
      setSuccess(null);
    }
  });

  // Test notification mutation
  const testMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.testBatchNotificationConfig(id);
      return response;
    },
    onSuccess: (data) => {
      setSuccess('Test notification sent successfully');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError('Failed to send test notification');
      setSuccess(null);
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EnvelopeIcon className="w-5 h-5" />;
      case 'slack':
        return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
      case 'webhook':
        return <GlobeAltIcon className="w-5 h-5" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'Email';
      case 'slack':
        return 'Slack';
      case 'webhook':
        return 'Webhook';
      case 'sms':
        return 'SMS';
      default:
        return type;
    }
  };

  const handleCreateNotification = (config: Omit<NotificationConfig, 'id'>) => {
    createMutation.mutate(config);
  };

  const handleUpdateNotification = (id: number, config: Partial<NotificationConfig>) => {
    updateMutation.mutate({ id, config });
  };

  const handleDeleteNotification = (id: number) => {
    if (window.confirm('Are you sure you want to delete this notification configuration?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleTestNotification = (id: number) => {
    testMutation.mutate(id);
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
          <h2 className="text-2xl font-bold text-gray-900">Notification Management</h2>
          <p className="text-gray-600">Configure alert and notification channels for batch processing</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Notification
        </button>
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

      {/* Notification Configurations List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Notification Configurations</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {notificationsData && notificationsData.length > 0 ? (
            notificationsData.map((notification: NotificationConfig) => (
              <div key={notification.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{notification.name}</h4>
                      <p className="text-sm text-gray-500">
                        {getNotificationTypeLabel(notification.type)} • 
                        {notification.conditions.length > 0 ? ` ${notification.conditions.join(', ')}` : ' All events'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      notification.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    <button
                      onClick={() => handleTestNotification(notification.id!)}
                      disabled={testMutation.isPending}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      Test
                    </button>
                    
                    <button
                      onClick={() => setEditingConfig(notification)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteNotification(notification.id!)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new notification configuration.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Notification
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Notification Form */}
      {(showAddForm || editingConfig) && (
        <NotificationForm
          config={editingConfig}
          onSave={(config) => {
            if (editingConfig) {
              handleUpdateNotification(editingConfig.id!, config);
            } else {
              handleCreateNotification(config);
            }
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingConfig(null);
          }}
        />
      )}
    </div>
  );
};

// Notification Form Component
interface NotificationFormProps {
  config?: NotificationConfig | null;
  onSave: (config: Omit<NotificationConfig, 'id'>) => void;
  onCancel: () => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({ config, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<NotificationConfig, 'id'>>({
    type: config?.type || 'email',
    name: config?.name || '',
    config: config?.config || {},
    conditions: config?.conditions || ['file_failed', 'batch_completed'],
    isActive: config?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getConfigFields = () => {
    switch (formData.type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
              <input
                type="text"
                value={formData.config.smtpHost || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, smtpHost: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
              <input
                type="number"
                value={formData.config.smtpPort || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, smtpPort: parseInt(e.target.value) }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.config.email || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, email: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={formData.config.password || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, password: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="App password"
              />
            </div>
          </div>
        );
      
      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
              <input
                type="url"
                value={formData.config.webhookUrl || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, webhookUrl: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Channel</label>
              <input
                type="text"
                value={formData.config.channel || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, channel: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="#alerts"
              />
            </div>
          </div>
        );
      
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
              <input
                type="url"
                value={formData.config.url || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, url: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://your-api.com/webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secret Key (Optional)</label>
              <input
                type="password"
                value={formData.config.secret || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, secret: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Secret key for webhook authentication"
              />
            </div>
          </div>
        );
      
      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={formData.config.phoneNumber || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, phoneNumber: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Twilio Account SID</label>
              <input
                type="text"
                value={formData.config.accountSid || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, accountSid: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="AC..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Twilio Auth Token</label>
              <input
                type="password"
                value={formData.config.authToken || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, authToken: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auth token"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {config ? 'Edit Notification' : 'Add Notification'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Production Alerts"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                type: e.target.value as NotificationConfig['type'],
                config: {} // Reset config when type changes
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="email">Email</option>
              <option value="slack">Slack</option>
              <option value="webhook">Webhook</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>

        {/* Configuration Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Configuration</label>
          {getConfigFields()}
        </div>

        {/* Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Conditions</label>
          <div className="space-y-2">
            {[
              { value: 'file_failed', label: 'File Processing Failed' },
              { value: 'batch_completed', label: 'Batch Job Completed' },
              { value: 'batch_failed', label: 'Batch Job Failed' },
              { value: 'folder_scan_completed', label: 'Folder Scan Completed' },
              { value: 'system_error', label: 'System Error' }
            ].map((condition) => (
              <div key={condition.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={condition.value}
                  checked={formData.conditions.includes(condition.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        conditions: [...prev.conditions, condition.value]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        conditions: prev.conditions.filter(c => c !== condition.value)
                      }));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={condition.value} className="ml-2 text-sm text-gray-700">
                  {condition.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Active (enable this notification)
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            {config ? 'Update' : 'Create'} Notification
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationManagementPanel;
