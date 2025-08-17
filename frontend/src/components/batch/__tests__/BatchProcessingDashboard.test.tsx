/**
 * Tests for BatchProcessingDashboard Component
 * Validates component rendering and data handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BatchProcessingDashboard from '../BatchProcessingDashboard';

// Mock the API service
jest.mock('../../../services/api', () => ({
  getBatchStatus: jest.fn().mockResolvedValue({
    success: true,
    data: {
      isRunning: true,
      activeJobs: 2,
      totalFiles: 150,
      completedFiles: 120,
      failedFiles: 5,
      skippedFiles: 3,
      successRate: 96.0,
      averageProcessingTime: 25.5
    }
  }),
  getBatchJobs: jest.fn().mockResolvedValue({
    success: true,
    data: {
      jobs: [
        {
          id: 1,
          name: 'Test Batch Job 1',
          status: 'running',
          totalFiles: 50,
          processedFiles: 30,
          failedFiles: 2,
          startedAt: '2024-12-19T10:00:00Z'
        },
        {
          id: 2,
          name: 'Test Batch Job 2',
          status: 'completed',
          totalFiles: 100,
          processedFiles: 100,
          failedFiles: 3,
          startedAt: '2024-12-19T09:00:00Z',
          completedAt: '2024-12-19T10:30:00Z'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1
      }
    }
  })
}));

// Mock the API service module
const mockApi = require('../../../services/api');

describe('BatchProcessingDashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render dashboard with loading state initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BatchProcessingDashboard />
      </QueryClientProvider>
    );

    expect(screen.getByText('Batch Processing Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should render dashboard with batch status data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BatchProcessingDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Active jobs
    });
  });

  test('should display processing statistics', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BatchProcessingDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Files')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
      expect(screen.getByText('96.0%')).toBeInTheDocument();
    });
  });

  test('should display recent batch jobs', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BatchProcessingDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Batch Jobs')).toBeInTheDocument();
      expect(screen.getByText('Test Batch Job 1')).toBeInTheDocument();
      expect(screen.getByText('Test Batch Job 2')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  test('should display job progress information', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BatchProcessingDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('30/50')).toBeInTheDocument(); // Progress for job 1
      expect(screen.getByText('100/100')).toBeInTheDocument(); // Progress for job 2
    });
  });

  test('should handle API errors gracefully', async () => {
    // Mock API error
    mockApi.getBatchStatus.mockRejectedValueOnce(new Error('API Error'));

    render(
      <QueryClientProvider client={queryClient}>
        <BatchProcessingDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading batch status')).toBeInTheDocument();
    });
  });

  test('should refresh data automatically', async () => {
    jest.useFakeTimers();

    render(
      <QueryClientProvider client={queryClient}>
        <BatchProcessingDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockApi.getBatchStatus).toHaveBeenCalledTimes(1);
    });

    // Fast-forward time to trigger refresh
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(mockApi.getBatchStatus).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });

  test('should display empty state when no jobs', async () => {
    // Mock empty jobs response
    mockApi.getBatchJobs.mockResolvedValueOnce({
      success: true,
      data: {
        jobs: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BatchProcessingDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No batch jobs found')).toBeInTheDocument();
    });
  });

  test('should display job status badges correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BatchProcessingDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const runningBadge = screen.getByText('Running');
      const completedBadge = screen.getByText('Completed');
      
      expect(runningBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
      expect(completedBadge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });
});
