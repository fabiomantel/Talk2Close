import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { getUIText } from '../../utils/hebrewUtils';
import { useErrorDialog, handleApiError } from '../../hooks/useErrorDialog';
import ErrorDialog from '../common/ErrorDialog';
import { 
  XMarkIcon,
  PlayIcon,
  ExclamationTriangleIcon
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

interface BatchJobFormData {
  name: string;
  folderId: number;
  description?: string;
  priority: 'low' | 'normal' | 'high';
  immediateProcessing: boolean;
  maxConcurrentFiles: number;
}

interface StartBatchJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (jobId: number) => void;
}

const StartBatchJobModal: React.FC<StartBatchJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<BatchJobFormData>({
    name: '',
    folderId: 0,
    description: '',
    priority: 'normal',
    immediateProcessing: true,
    maxConcurrentFiles: 5
  });

  const { error, isOpen: isErrorOpen, showError, hideError } = useErrorDialog();
  const queryClient = useQueryClient();

  // Fetch available folders
  const { data: foldersData, isLoading: foldersLoading } = useQuery({
    queryKey: ['external-folders'],
    queryFn: apiService.getExternalFolders,
    enabled: isOpen
  });

  // Create batch job mutation
  const createBatchJobMutation = useMutation({
    mutationFn: apiService.createBatchJob,
    onSuccess: (data) => {
      console.log('✅ Batch job created successfully:', data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['batch-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['batch-status'] });
      
      // Call success callback
      if (onSuccess && data.data?.id) {
        onSuccess(data.data.id);
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        folderId: 0,
        description: '',
        priority: 'normal',
        immediateProcessing: true,
        maxConcurrentFiles: 5
      });
      onClose();
    },
    onError: (error) => {
      console.error('❌ Failed to create batch job:', error);
      handleApiError(error, showError);
    }
  });

  const folders: ExternalFolder[] = foldersData?.data?.folders || [];
  const activeFolders = folders.filter(folder => folder.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('Job name is required');
      return;
    }
    
    if (!formData.folderId) {
      showError('Please select a folder');
      return;
    }

    const selectedFolder = folders.find(f => f.id === formData.folderId);
    if (!selectedFolder) {
      showError('Selected folder not found');
      return;
    }

    const jobData = {
      folderId: formData.folderId,
      options: {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        priority: formData.priority,
        immediateProcessing: formData.immediateProcessing,
        maxConcurrentFiles: formData.maxConcurrentFiles
      }
    };

    console.log('🚀 Creating batch job:', jobData);
    createBatchJobMutation.mutate(jobData);
  };

  const handleClose = () => {
    if (!createBatchJobMutation.isPending) {
      setFormData({
        name: '',
        folderId: 0,
        description: '',
        priority: 'normal',
        immediateProcessing: true,
        maxConcurrentFiles: 5
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 hebrew-content">
                {getUIText('start_new_batch_job')}
              </h3>
              <button
                onClick={handleClose}
                disabled={createBatchJobMutation.isPending}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Job Name */}
              <div>
                <label htmlFor="jobName" className="block text-sm font-medium text-gray-700 hebrew-content">
                  {getUIText('job_name')} *
                </label>
                <input
                  type="text"
                  id="jobName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter job name"
                  disabled={createBatchJobMutation.isPending}
                  required
                />
              </div>

              {/* Folder Selection */}
              <div>
                <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 hebrew-content">
                  {getUIText('select_folder')} *
                </label>
                <select
                  id="folderId"
                  value={formData.folderId}
                  onChange={(e) => setFormData({ ...formData, folderId: parseInt(e.target.value) })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={createBatchJobMutation.isPending || foldersLoading}
                  required
                >
                  <option value={0}>{foldersLoading ? 'Loading...' : 'Select a folder'}</option>
                  {activeFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name} ({folder.storageConfig.type})
                    </option>
                  ))}
                </select>
                {activeFolders.length === 0 && !foldersLoading && (
                  <p className="mt-1 text-sm text-red-600 hebrew-content">
                    {getUIText('no_active_folders')}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 hebrew-content">
                  {getUIText('description')} (Optional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter job description"
                  disabled={createBatchJobMutation.isPending}
                />
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 hebrew-content">
                  {getUIText('priority')}
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'normal' | 'high' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={createBatchJobMutation.isPending}
                >
                  <option value="low">{getUIText('low_priority')}</option>
                  <option value="normal">{getUIText('normal_priority')}</option>
                  <option value="high">{getUIText('high_priority')}</option>
                </select>
              </div>

              {/* Processing Options */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="immediateProcessing"
                    type="checkbox"
                    checked={formData.immediateProcessing}
                    onChange={(e) => setFormData({ ...formData, immediateProcessing: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={createBatchJobMutation.isPending}
                  />
                  <label htmlFor="immediateProcessing" className="mr-2 block text-sm text-gray-700 hebrew-content">
                    {getUIText('immediate_processing')}
                  </label>
                </div>

                <div>
                  <label htmlFor="maxConcurrentFiles" className="block text-sm font-medium text-gray-700 hebrew-content">
                    {getUIText('max_concurrent_files')}
                  </label>
                  <input
                    type="number"
                    id="maxConcurrentFiles"
                    min="1"
                    max="20"
                    value={formData.maxConcurrentFiles}
                    onChange={(e) => setFormData({ ...formData, maxConcurrentFiles: parseInt(e.target.value) })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={createBatchJobMutation.isPending}
                  />
                </div>
              </div>

              {/* Warning for no active folders */}
              {activeFolders.length === 0 && !foldersLoading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    <div className="mr-3">
                      <p className="text-sm text-yellow-800 hebrew-content">
                        {getUIText('no_active_folders_warning')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={createBatchJobMutation.isPending}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {getUIText('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createBatchJobMutation.isPending || activeFolders.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createBatchJobMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {getUIText('creating')}...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4 mr-2" />
                      {getUIText('start_job')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Error Dialog */}
      <ErrorDialog
        error={error}
        isOpen={isErrorOpen}
        onClose={hideError}
      />
    </>
  );
};

export default StartBatchJobModal;
