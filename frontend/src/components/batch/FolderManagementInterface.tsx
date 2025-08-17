import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { getUIText } from '../../utils/hebrewUtils';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  FolderIcon,
  CloudIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

interface ExternalFolder {
  id: number;
  name: string;
  storageConfig: {
    type: string;
    config: any;
  };
  monitorConfig: {
    type: string;
    config: any;
  };
  processingConfig: {
    maxFileSize: number;
    allowedExtensions: string[];
    autoStart: boolean;
  };
  isActive: boolean;
  lastScan?: string;
  createdAt: string;
  updatedAt: string;
}

interface FolderFormData {
  name: string;
  storage: {
    type: string;
    config: {
      path?: string;
      bucket?: string;
      prefix?: string;
      [key: string]: any;
    };
  };
  monitor: {
    type: string;
    config: {
      scanInterval?: number;
      [key: string]: any;
    };
  };
  processing: {
    maxFileSize: number;
    allowedExtensions: string[];
    autoStart: boolean;
  };
}

interface FolderManagementInterfaceProps {
  onFolderSelect?: (folderId: number) => void;
  onTestFolder?: (folderId: number) => void;
}

const FolderManagementInterface: React.FC<FolderManagementInterfaceProps> = ({
  onFolderSelect,
  onTestFolder
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<ExternalFolder | null>(null);
  const [formData, setFormData] = useState<FolderFormData>({
    name: '',
    storage: {
      type: 'local',
      config: {
        path: ''
      }
    },
    monitor: {
      type: 'polling',
      config: {
        scanInterval: 300
      }
    },
    processing: {
      maxFileSize: 524288000,
      allowedExtensions: ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
      autoStart: true
    }
  });

  const queryClient = useQueryClient();

  // Fetch folders
  const { data: foldersData, isLoading } = useQuery({
    queryKey: ['external-folders'],
    queryFn: () => apiService.getExternalFolders()
  });

  // Fetch available providers
  const { data: providersData } = useQuery({
    queryKey: ['providers'],
    queryFn: () => apiService.getAvailableProviders()
  });

  const folders: ExternalFolder[] = foldersData?.data?.folders || [];
  const providers = providersData?.data || {
    storage: [],
    notification: [],
    monitor: []
  };

  // Create/Update folder mutation
  const folderMutation = useMutation({
    mutationFn: async (data: FolderFormData) => {
      const folderData = {
        name: data.name,
        storage: {
          type: data.storage.type,
          config: data.storage.config
        },
        monitor: {
          type: data.monitor.type,
          config: data.monitor.config
        },
        processing: data.processing
      };

      if (editingFolder) {
        return apiService.updateExternalFolder(editingFolder.id, folderData);
      } else {
        return apiService.createExternalFolder(folderData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-folders'] });
      closeModal();
    }
  });

  // Delete folder mutation
  const deleteMutation = useMutation({
    mutationFn: (folderId: number) => apiService.deleteExternalFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-folders'] });
    }
  });

  // Test folder mutation
  const testMutation = useMutation({
    mutationFn: (folderId: number) => apiService.testExternalFolder(folderId)
  });

  const openModal = (folder?: ExternalFolder) => {
    if (folder) {
      setEditingFolder(folder);
      setFormData({
        name: folder.name,
        storage: folder.storageConfig,
        monitor: folder.monitorConfig,
        processing: folder.processingConfig
      });
    } else {
      setEditingFolder(null);
      setFormData({
        name: '',
        storage: {
          type: 'local',
          config: {
            path: ''
          }
        },
        monitor: {
          type: 'polling',
          config: {
            scanInterval: 300
          }
        },
        processing: {
          maxFileSize: 524288000,
          allowedExtensions: ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
          autoStart: true
        }
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFolder(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    folderMutation.mutate(formData);
  };

  const handleDelete = (folderId: number) => {
    if (window.confirm(getUIText('are_you_sure_delete_folder'))) {
      deleteMutation.mutate(folderId);
    }
  };

  const handleTest = (folderId: number) => {
    testMutation.mutate(folderId);
  };

  const getStorageIcon = (type: string) => {
    switch (type) {
      case 's3': return <CloudIcon className="w-5 h-5" />;
      case 'local': return <ServerIcon className="w-5 h-5" />;
      default: return <FolderIcon className="w-5 h-5" />;
    }
  };

  const getStorageName = (type: string) => {
    switch (type) {
      case 's3': return getUIText('aws_s3');
      case 'local': return getUIText('local_file_system');
      default: return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-8 w-48 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rtl-layout">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 hebrew-content">{getUIText('folder_management')}</h1>
          <p className="text-gray-600 hebrew-content">{getUIText('folder_management_description')}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          {getUIText('add_folder')}
        </button>
      </div>

      {/* Folders Grid */}
      {folders.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 hebrew-content">{getUIText('no_folders_configured')}</h3>
          <p className="mt-1 text-sm text-gray-500 hebrew-content">{getUIText('no_folders_description')}</p>
          <div className="mt-6">
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {getUIText('add_folder')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <div key={folder.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStorageIcon(folder.storageConfig.type)}
                    <h3 className="ml-2 text-lg font-medium text-gray-900">{folder.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTest(folder.id)}
                      disabled={testMutation.isPending}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title={getUIText('test_connection')}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openModal(folder)}
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title={getUIText('edit_folder')}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(folder.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-900 p-1"
                      title={getUIText('delete_folder')}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 hebrew-content">{getUIText('storage')}:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {getStorageName(folder.storageConfig.type)}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 hebrew-content">{getUIText('monitor')}:</span>
                    <span className="ml-2 text-sm text-gray-900 capitalize">
                      {folder.monitorConfig.type}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 hebrew-content">{getUIText('max_file_size')}:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {formatFileSize(folder.processingConfig.maxFileSize)}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 hebrew-content">{getUIText('extensions')}:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {folder.processingConfig.allowedExtensions.join(', ')}
                    </span>
                  </div>

                  {folder.lastScan && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 hebrew-content">{getUIText('last_scan')}:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {new Date(folder.lastScan).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      folder.isActive ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm text-gray-500 hebrew-content">
                      {folder.isActive ? getUIText('active') : getUIText('inactive')}
                    </span>
                  </div>

                  {onFolderSelect && (
                    <button
                      onClick={() => onFolderSelect(folder.id)}
                      className="text-sm text-blue-600 hover:text-blue-900 font-medium hebrew-content"
                    >
                      {getUIText('select')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test Results */}
      {testMutation.data && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg max-w-md ${
          testMutation.data.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            {testMutation.data.success ? (
              <CheckIcon className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
            ) : (
              <XMarkIcon className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
            )}
            <div className="flex-1">
              <span className={`text-sm font-medium ${
                testMutation.data.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testMutation.data.success ? getUIText('folder_test_passed') : getUIText('folder_test_failed')}
              </span>
              {testMutation.data.data && testMutation.data.data.tests && (
                <div className="mt-2 space-y-1">
                  {testMutation.data.data.tests.storage && (
                    <div className="text-xs">
                      <span className="font-medium">Storage:</span> 
                      <span className={testMutation.data.data.tests.storage.success ? 'text-green-600' : 'text-red-600'}>
                        {testMutation.data.data.tests.storage.success ? ' ✓' : ' ✗'}
                      </span>
                      {!testMutation.data.data.tests.storage.success && testMutation.data.data.tests.storage.error && (
                        <span className="text-red-600 ml-1">({testMutation.data.data.tests.storage.error})</span>
                      )}
                    </div>
                  )}
                  {testMutation.data.data.tests.monitor && (
                    <div className="text-xs">
                      <span className="font-medium">Monitor:</span> 
                      <span className={testMutation.data.data.tests.monitor.success ? 'text-green-600' : 'text-red-600'}>
                        {testMutation.data.data.tests.monitor.success ? ' ✓' : ' ✗'}
                      </span>
                      {!testMutation.data.data.tests.monitor.success && testMutation.data.data.tests.monitor.error && (
                        <span className="text-red-600 ml-1">({testMutation.data.data.tests.monitor.error})</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4 hebrew-content">
                {editingFolder ? getUIText('edit_folder_title') : getUIText('add_new_folder_title')}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                    {getUIText('folder_name')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                {/* Storage Configuration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                    {getUIText('storage_provider')}
                  </label>
                  <select
                    value={formData.storage.type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      storage: { 
                        ...formData.storage, 
                        type: e.target.value,
                        config: e.target.value === 'local' ? { path: '' } : {}
                      } 
                    })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {providers.storage.map((provider: string) => (
                      <option key={provider} value={provider}>
                        {getStorageName(provider)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Storage Configuration Fields */}
                {formData.storage.type === 'local' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                      {getUIText('folder_path')}
                    </label>
                    <input
                      type="text"
                      value={formData.storage.config.path || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        storage: {
                          ...formData.storage,
                          config: {
                            ...formData.storage.config,
                            path: e.target.value
                          }
                        },
                        monitor: {
                          ...formData.monitor,
                          config: {
                            ...formData.monitor.config,
                            path: e.target.value
                          }
                        }
                      })}
                      placeholder="/path/to/folder"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500 hebrew-content">
                      {getUIText('folder_path_description')}
                    </p>
                  </div>
                )}

                {formData.storage.type === 's3' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                        {getUIText('bucket_name')}
                      </label>
                      <input
                        type="text"
                        value={formData.storage.config.bucket || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          storage: {
                            ...formData.storage,
                            config: {
                              ...formData.storage.config,
                              bucket: e.target.value
                            }
                          }
                        })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                        {getUIText('prefix')} (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.storage.config.prefix || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          storage: {
                            ...formData.storage,
                            config: {
                              ...formData.storage.config,
                              prefix: e.target.value
                            }
                          }
                        })}
                        placeholder="folder/subfolder/"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Monitor Configuration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                    {getUIText('monitor_type')}
                  </label>
                  <select
                    value={formData.monitor.type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      monitor: { 
                        ...formData.monitor, 
                        type: e.target.value 
                      } 
                    })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {providers.monitor.map((provider: string) => (
                      <option key={provider} value={provider}>
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monitor Configuration Fields */}
                {formData.monitor.type === 'polling' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                      {getUIText('scan_interval')} (seconds)
                    </label>
                    <input
                      type="number"
                      value={formData.monitor.config.scanInterval || 300}
                      onChange={(e) => setFormData({
                        ...formData,
                        monitor: {
                          ...formData.monitor,
                          config: {
                            ...formData.monitor.config,
                            scanInterval: parseInt(e.target.value),
                            path: formData.storage.type === 'local' ? formData.storage.config.path : undefined
                          }
                        }
                      })}
                      min="30"
                      max="3600"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500 hebrew-content">
                      {getUIText('scan_interval_description')}
                    </p>
                  </div>
                )}

                {/* Processing Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                      {getUIText('max_file_size')} (MB)
                    </label>
                    <input
                      type="number"
                      value={Math.round(formData.processing.maxFileSize / (1024 * 1024))}
                      onChange={(e) => setFormData({
                        ...formData,
                        processing: {
                          ...formData.processing,
                          maxFileSize: parseInt(e.target.value) * 1024 * 1024
                        }
                      })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="1"
                      max="2048"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
                      {getUIText('auto_start')}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.processing.autoStart}
                        onChange={(e) => setFormData({
                          ...formData,
                          processing: {
                            ...formData.processing,
                            autoStart: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 hebrew-content">{getUIText('start_processing_automatically')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {getUIText('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={folderMutation.isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {folderMutation.isPending ? getUIText('saving') : (editingFolder ? getUIText('update') : getUIText('create'))}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderManagementInterface;
