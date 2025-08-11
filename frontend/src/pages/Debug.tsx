import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ServerIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { config } from '../config/environment';

interface DebugSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDuration: number;
  status: 'started' | 'completed' | 'failed';
  customerName: string;
  fileName: string;
  overallScore?: number;
  uploadDuration: number;
  whisperDuration: number;
  gpt4Duration: number;
  scoringDuration: number;
  databaseDuration: number;
}

interface PerformanceMetrics {
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  averageTotalDuration: number;
  averageUploadDuration: number;
  averageWhisperDuration: number;
  averageGPT4Duration: number;
  averageScoringDuration: number;
  averageDatabaseDuration: number;
  totalTokensUsed: number;
  totalCost: number;
}

interface DetailedSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDuration: number;
  status: string;
  errors: string[];
  upload: {
    startTime: number;
    endTime?: number;
    duration: number;
    fileName: string;
    fileSize: number;
    fileType: string;
    customerName: string;
    status: string;
    error?: string;
  };
  whisper: {
    startTime: number;
    endTime?: number;
    duration: number;
    filePath: string;
    fileSize: number;
    request: {
      model: string;
      language: string;
      responseFormat: string;
      timestampGranularities: string[];
    };
    response: {
      text: string;
      language: string;
      duration: number;
      segments: number;
      wordCount: number;
      characterCount: number;
    };
    status: string;
    error?: string;
  };
  gpt4: {
    startTime: number;
    endTime?: number;
    duration: number;
    transcript: string;
    transcriptLength: number;
    wordCount: number;
    analysisTypes: string[];
    requests: Array<{
      id: string;
      type: string;
      startTime: number;
      endTime?: number;
      duration: number;
      request: {
        model: string;
        temperature: number;
        maxTokens: number;
        prompt: string;
        promptLength: number;
        responseFormat: Record<string, any>;
      };
      response: {
        content: string;
        contentLength: number;
        tokensUsed?: number;
        cost?: number;
      };
      status: string;
      error?: string;
    }>;
    status: string;
    overallResult: {
      success: boolean;
      overallConfidence: number;
      totalTokensUsed: number;
      totalCost: number;
      errors: string[];
    };
    error?: string;
  };
  scoring: {
    startTime: number;
    endTime?: number;
    duration: number;
    transcript: string;
    wordCount: number;
    analysisType: string;
    useEnhancedAnalysis: boolean;
    status: string;
    scores: {
      urgency: number;
      budget: number;
      interest: number;
      engagement: number;
      overall: number;
    };
    analysis: {
      keyPhrases: Record<string, string[]>;
      objections: string[];
      confidence: number;
      enhancedNotes?: string;
    };
    metadata: Record<string, any>;
  };
  database: {
    startTime: number;
    endTime?: number;
    duration: number;
    operation: string;
    table: string;
    recordId?: number;
    dataSize: number;
    status: string;
    error?: string;
    affectedRows?: number;
  };
}

const Debug: React.FC = () => {
  const navigate = useNavigate();
  const isDebugEnabled = config.DEBUG_MODE;
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch debug sessions
  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ['debug-sessions'],
    queryFn: () => apiService.getDebugSessions(),
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds if auto-refresh is enabled
    enabled: isDebugEnabled,
  });

  // Fetch performance metrics
  const { data: metricsData } = useQuery({
    queryKey: ['debug-metrics'],
    queryFn: () => apiService.getDebugMetrics(),
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
    enabled: isDebugEnabled,
  });

  // Fetch detailed session data
  const { data: detailedSession } = useQuery({
    queryKey: ['debug-session', selectedSession],
    queryFn: () => selectedSession ? apiService.getDebugSession(selectedSession) : null,
    enabled: isDebugEnabled && !!selectedSession,
  });

  // Redirect if debug is not enabled
  useEffect(() => {
    if (!isDebugEnabled) {
      navigate('/', { replace: true });
    }
  }, [isDebugEnabled, navigate]);

  // Don't render anything if debug is not enabled
  if (!isDebugEnabled) {
    return null;
  }

  const sessions: DebugSession[] = sessionsData?.data?.sessions || [];
  const metrics: PerformanceMetrics = metricsData?.data?.metrics || {};
  const session: DetailedSession | null = detailedSession?.data?.session || null;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'started':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'started':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Debug Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor analysis pipeline performance and flow</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
              </label>
              <button
                onClick={() => refetchSessions()}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {metrics && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Performance Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center">
                  <ClockIcon className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.totalSessions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 sm:h-8 w-6 sm:w-8 text-green-500" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.completedSessions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center">
                  <XCircleIcon className="h-6 sm:h-8 w-6 sm:w-8 text-red-500" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.failedSessions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatDuration(metrics.averageTotalDuration)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Recent Sessions</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>No debug sessions found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <div
                        key={session.sessionId}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedSession === session.sessionId ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedSession(session.sessionId)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono text-gray-600">
                            {session.sessionId.substring(0, 8)}...
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(session.startTime).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">{session.customerName}</div>
                          <div className="text-sm text-gray-900">{session.fileName}</div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            {getStatusIcon(session.status)}
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                              {session.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">{formatDuration(session.totalDuration)}</div>
                        </div>
                        {session.overallScore && (
                          <div className="mt-2 text-sm text-gray-600">
                            Score: {session.overallScore ? `${session.overallScore}/100` : '-'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            {selectedSession && session ? (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Session Details: {session.sessionId}
                  </h2>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Upload Details */}
                  <div className="mb-6 sm:mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                      File Upload
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">File Name</p>
                        <p className="text-sm font-medium">{session.upload?.fileName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">File Size</p>
                        <p className="text-sm font-medium">{session.upload?.fileSize ? formatFileSize(session.upload.fileSize) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="text-sm font-medium">{session.upload?.customerName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-sm font-medium">{session.upload?.duration ? formatDuration(session.upload.duration) : 'N/A'}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="flex items-center">
                          {getStatusIcon(session.upload?.status || 'unknown')}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.upload?.status || 'unknown')}`}>
                            {session.upload?.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Whisper Details */}
                  <div className="mb-6 sm:mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Whisper Transcription
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-sm font-medium">{session.whisper?.duration ? formatDuration(session.whisper.duration) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Word Count</p>
                        <p className="text-sm font-medium">{session.whisper?.response?.wordCount || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Language</p>
                        <p className="text-sm font-medium">{session.whisper?.response?.language || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="flex items-center">
                          {getStatusIcon(session.whisper?.status || 'unknown')}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.whisper?.status || 'unknown')}`}>
                            {session.whisper?.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Whisper Request Details */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        Request Details
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(session.whisper?.request || {}, null, 2)}
                      </pre>
                    </details>
                  </div>

                  {/* GPT-4 Details */}
                  {session.gpt4 && (
                    <div className="mb-6 sm:mb-8">
                      <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                        <CpuChipIcon className="h-5 w-5 mr-2" />
                        GPT-4 Analysis
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="text-sm font-medium">{session.gpt4?.duration ? formatDuration(session.gpt4.duration) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Word Count</p>
                          <p className="text-sm font-medium">{session.gpt4?.wordCount || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Tokens</p>
                          <p className="text-sm font-medium">{session.gpt4?.overallResult?.totalTokensUsed || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Confidence</p>
                          <p className="text-sm font-medium">{session.gpt4?.overallResult ? `${(session.gpt4.overallResult.overallConfidence * 100).toFixed(1)}%` : 'N/A'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-sm text-gray-600">Status</p>
                          <div className="flex items-center">
                            {getStatusIcon(session.gpt4?.status || 'unknown')}
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.gpt4?.status || 'unknown')}`}>
                              {session.gpt4?.status || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* GPT-4 Requests */}
                      {session.gpt4?.requests && session.gpt4.requests.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Individual Requests</h5>
                          <div className="space-y-2">
                            {session.gpt4.requests.map((request) => (
                              <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                                  <span className="text-sm font-medium">{request.type}</span>
                                  <span className="text-sm text-gray-600">{formatDuration(request.duration)}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  <p>Tokens: {request.response?.tokensUsed || 'N/A'}</p>
                                  <p>Cost: ${request.response?.cost?.toFixed(4) || 'N/A'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scoring Details */}
                  <div className="mb-6 sm:mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <ServerIcon className="h-5 w-5 mr-2" />
                      Scoring Analysis
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-sm font-medium">{session.scoring?.duration ? formatDuration(session.scoring.duration) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Analysis Type</p>
                        <p className="text-sm font-medium">{session.scoring?.analysisType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Overall Score</p>
                        <p className="text-sm font-medium">{session.scoring?.scores?.overall || 0}/100</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Confidence</p>
                        <p className="text-sm font-medium">{session.scoring?.analysis?.confidence || 0}%</p>
                      </div>
                    </div>

                    {/* Individual Scores */}
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Individual Scores</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Urgency</p>
                          <p className="text-lg font-bold text-blue-600">{session.scoring?.scores?.urgency || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Budget</p>
                          <p className="text-lg font-bold text-green-600">{session.scoring?.scores?.budget || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Interest</p>
                          <p className="text-lg font-bold text-yellow-600">{session.scoring?.scores?.interest || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Engagement</p>
                          <p className="text-lg font-bold text-purple-600">{session.scoring?.scores?.engagement || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Database Details */}
                  <div className="mb-6 sm:mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <ServerIcon className="h-5 w-5 mr-2" />
                      Database Operations
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Operation</p>
                        <p className="text-sm font-medium">{session.database?.operation || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Table</p>
                        <p className="text-sm font-medium">{session.database?.table || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-sm font-medium">{session.database?.duration ? formatDuration(session.database.duration) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="flex items-center">
                          {getStatusIcon(session.database?.status || 'unknown')}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.database?.status || 'unknown')}`}>
                            {session.database?.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Errors */}
                  {session.errors && session.errors.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <h4 className="text-md font-medium text-red-900 mb-4 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        Errors
                      </h4>
                      <div className="space-y-2">
                        {session.errors.map((error, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">{error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>Select a session to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug;
