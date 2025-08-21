import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StartBatchJobModal from '../StartBatchJobModal';
import { apiService } from '../../../services/api';

// Mock the API service
jest.mock('../../../services/api', () => ({
  apiService: {
    getExternalFolders: jest.fn(),
    createBatchJob: jest.fn()
  }
}));

// Mock the error dialog hook
jest.mock('../../../hooks/useErrorDialog', () => ({
  useErrorDialog: () => ({
    error: null,
    isOpen: false,
    showError: jest.fn(),
    hideError: jest.fn()
  }),
  handleApiError: jest.fn()
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('StartBatchJobModal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Mock successful folder fetch
    mockApiService.getExternalFolders.mockResolvedValue({
      success: true,
      data: {
        folders: [
          {
            id: 1,
            name: 'Test Folder',
            storageConfig: { type: 'local', config: {} },
            monitorConfig: { type: 'polling', config: {} },
            processingConfig: { maxFileSize: 1000000, allowedExtensions: ['.mp3'], autoStart: true },
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      }
    });

    // Mock successful batch job creation
    mockApiService.createBatchJob.mockResolvedValue({
      success: true,
      data: { id: 1, name: 'Test Job' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <StartBatchJobModal
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  test('renders modal when open', () => {
    renderModal();
    
    expect(screen.getByText('התחל תהליך עיבוד מרוכז חדש')).toBeInTheDocument();
    expect(screen.getByLabelText('שם תהליך *')).toBeInTheDocument();
    expect(screen.getByLabelText('בחר תיקייה *')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    renderModal({ isOpen: false });
    
    expect(screen.queryByText('התחל תהליך עיבוד מרוכז חדש')).not.toBeInTheDocument();
  });

  test('loads and displays folders', async () => {
    renderModal();

    await waitFor(() => {
      expect(mockApiService.getExternalFolders).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Folder (local)')).toBeInTheDocument();
    });
  });

  test('shows warning when no active folders', async () => {
    mockApiService.getExternalFolders.mockResolvedValue({
      success: true,
      data: { folders: [] }
    });

    renderModal();

    await waitFor(() => {
      expect(screen.getByText('אין תיקיות פעילות')).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    const onSuccess = jest.fn();
    renderModal({ onSuccess });

    // Try to submit without filling required fields
    const submitButton = screen.getByText('התחל תהליך');
    fireEvent.click(submitButton);

    // Should not call the API
    await waitFor(() => {
      expect(mockApiService.createBatchJob).not.toHaveBeenCalled();
    });
  });

  test('creates batch job successfully', async () => {
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    renderModal({ onSuccess, onClose });

    // Wait for folders to load
    await waitFor(() => {
      expect(screen.getByText('Test Folder (local)')).toBeInTheDocument();
    });

    // Fill in required fields
    fireEvent.change(screen.getByLabelText('שם תהליך *'), {
      target: { value: 'Test Job' }
    });

    fireEvent.change(screen.getByLabelText('בחר תיקייה *'), {
      target: { value: '1' }
    });

    // Submit form
    const submitButton = screen.getByText('התחל תהליך');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiService.createBatchJob).toHaveBeenCalledWith({
        folderId: 1,
        options: {
          name: 'Test Job',
          description: '',
          priority: 'normal',
          immediateProcessing: true,
          maxConcurrentFiles: 5
        }
      });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(1);
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('handles form reset on close', () => {
    const onClose = jest.fn();
    renderModal({ onClose });

    // Fill in some fields
    fireEvent.change(screen.getByLabelText('שם תהליך *'), {
      target: { value: 'Test Job' }
    });

    // Close modal
    const closeButton = screen.getByRole('button', { name: /ביטול/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
