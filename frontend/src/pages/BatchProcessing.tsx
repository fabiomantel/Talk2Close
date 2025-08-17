import React, { useState } from 'react';
import BatchProcessingDashboard from '../components/batch/BatchProcessingDashboard';
import FolderManagementInterface from '../components/batch/FolderManagementInterface';
import { 
  FolderIcon, 
  ChartBarIcon, 
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline';

type TabType = 'dashboard' | 'folders' | 'configuration' | 'notifications';

const BatchProcessing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Dashboard',
      icon: ChartBarIcon,
      description: 'Monitor batch processing activities'
    },
    {
      id: 'folders' as TabType,
      name: 'Folders',
      icon: FolderIcon,
      description: 'Manage external folders'
    },
    {
      id: 'configuration' as TabType,
      name: 'Configuration',
      icon: CogIcon,
      description: 'System settings and preferences'
    },
    {
      id: 'notifications' as TabType,
      name: 'Notifications',
      icon: BellIcon,
      description: 'Alert and notification settings'
    }
  ];

  const handleStartBatch = () => {
    // TODO: Implement start batch functionality
    console.log('Start batch processing');
  };

  const handleStopBatch = (jobId: number) => {
    // TODO: Implement stop batch functionality
    console.log('Stop batch job:', jobId);
  };

  const handleViewDetails = (jobId: number) => {
    // TODO: Navigate to job details
    console.log('View job details:', jobId);
  };

  const handleFolderSelect = (folderId: number) => {
    // TODO: Handle folder selection
    console.log('Select folder:', folderId);
  };

  const handleTestFolder = (folderId: number) => {
    // TODO: Handle folder testing
    console.log('Test folder:', folderId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <BatchProcessingDashboard
            onStartBatch={handleStartBatch}
            onStopBatch={handleStopBatch}
            onViewDetails={handleViewDetails}
          />
        );
      case 'folders':
        return (
          <FolderManagementInterface
            onFolderSelect={handleFolderSelect}
            onTestFolder={handleTestFolder}
          />
        );
      case 'configuration':
        return (
          <div className="text-center py-12">
            <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Configuration</h3>
            <p className="mt-1 text-sm text-gray-500">System configuration settings coming soon.</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Notifications</h3>
            <p className="mt-1 text-sm text-gray-500">Notification settings coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Batch Processing</h1>
          <p className="mt-2 text-gray-600">
            Automatically process multiple Hebrew sales call recordings from external folders
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchProcessing;
