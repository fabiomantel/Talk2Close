import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PlayIcon, 
  StopIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  FolderIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface BatchJob {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  skippedFiles: number;
  startedAt: string;
  completedAt?: string;
  folderId: number;
  folderName: string;
}

interface BatchStats {
  total: number;
  byStatus: Record<string, number>;
  averageFileSize: number;
  averageProcessingTime: number;
  totalRetries: number;
  successRate: number;
}

interface SystemStatus {
  isProcessing: boolean;
  activeJobCount: number;
  activeJobIds: number[];
}

interface BatchProcessingDashboardProps {
  onStartBatch?: () => void;
  onStopBatch?: (jobId: number) => void;
  onViewDetails?: (jobId: number) => void;
}

const BatchProcessingDashboard: React.FC<BatchProcessingDashboardProps> = ({
  onStartBatch,
  onStopBatch,
  onViewDetails
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch batch processing status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['batch-status'],
    queryFn: async () => {
      const response = await fetch('/api/batch/status');
      if (!response.ok) throw new Error('Failed to fetch batch status');
      return response.json();
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Fetch recent batch jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['batch-jobs'],
    queryFn: async () => {
      const response = await fetch('/api/batch/jobs?limit=10');
      if (!response.ok) throw new Error('Failed to fetch batch jobs');
      return response.json();
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const systemStatus: SystemStatus = statusData?.data?.systemStatus || {
    isProcessing: false,
    activeJobCount: 0,
    activeJobIds: []
  };

  const recentJobs: BatchJob[] = jobsData?.data?.jobs || [];
  const stats: BatchStats = statusData?.data?.overallStats || {
    total: 0,
    byStatus: {},
    averageFileSize: 0,
    averageProcessingTime: 0,
    totalRetries: 0,
    successRate: 0
  };

  const filteredJobs = selectedStatus === 'all' 
    ? recentJobs 
    : recentJobs.filter(job => job.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <ClockIcon className="w-4 h-4" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'failed': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'cancelled': return <StopIcon className="w-4 h-4" />;
      default: return <DocumentIcon className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (statusLoading || jobsLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Processing Dashboard</h1>
          <p className="text-gray-600">Monitor and manage batch file processing operations</p>
        </div>
        <div className="flex space-x-3">
          {onStartBatch && (
            <button
              onClick={onStartBatch}
              disabled={systemStatus.isProcessing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              Start New Batch
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Files Processed</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.successRate.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Processing Time</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatDuration(stats.averageProcessingTime)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                  <dd className="text-lg font-medium text-gray-900">{systemStatus.activeJobCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Status</h3>
          <div className="flex items-center space-x-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              systemStatus.isProcessing 
                ? 'text-green-800 bg-green-100' 
                : 'text-gray-800 bg-gray-100'
            }`}>
              {systemStatus.isProcessing ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Processing
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  Idle
                </>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {systemStatus.activeJobCount} active job{systemStatus.activeJobCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Batch Jobs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Batch Jobs</h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No batch jobs</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new batch processing job.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => {
                    const progress = job.totalFiles > 0 
                      ? (job.processedFiles / job.totalFiles) * 100 
                      : 0;
                    
                    return (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{job.name}</div>
                            <div className="text-sm text-gray-500">{job.folderName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {getStatusIcon(job.status)}
                            <span className="ml-1 capitalize">{job.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {job.processedFiles}/{job.totalFiles}
                            </span>
                          </div>
                          {job.failedFiles > 0 && (
                            <div className="text-xs text-red-500 mt-1">
                              {job.failedFiles} failed
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(job.startedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {onViewDetails && (
                              <button
                                onClick={() => onViewDetails(job.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </button>
                            )}
                            {onStopBatch && job.status === 'running' && (
                              <button
                                onClick={() => onStopBatch(job.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Stop
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchProcessingDashboard;
