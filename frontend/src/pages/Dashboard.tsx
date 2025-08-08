import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import StatsCards from '../components/dashboard/StatsCards';
import ScoreChart from '../components/dashboard/ScoreChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getUIText } from '../utils/hebrewUtils';

const Dashboard: React.FC = () => {
  console.log('📊 Dashboard Component: Loading dashboard data');
  
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: apiService.getDashboardStats,
    retry: 2,
    retryDelay: 1000,
  });

  console.log('📈 Dashboard Stats:', { statsData, statsLoading, statsError });

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ['scoring-analytics'],
    queryFn: apiService.getScoringAnalytics,
    retry: 2,
    retryDelay: 1000,
  });

  console.log('📊 Dashboard Analytics:', { analyticsData, analyticsLoading, analyticsError });

  if (statsLoading || analyticsLoading) {
    return <LoadingSpinner />;
  }

  if (statsError || analyticsError) {
    const errorMessage = statsError?.message || analyticsError?.message || "Failed to load dashboard data";
    console.error('Dashboard Error:', { statsError, analyticsError });
    return <ErrorMessage message={errorMessage} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 hebrew-content">{getUIText('dashboard')}</h1>
        <div className="text-sm text-gray-500 hebrew-content">
          עודכן לאחרונה: {new Date().toLocaleString('he-IL')}
        </div>
      </div>

      {statsData && (
        <StatsCards stats={statsData.data} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analyticsData && (
          <ScoreChart data={analyticsData.data} />
        )}
        <RecentActivity />
      </div>
    </div>
  );
};

export default Dashboard; 