import { config } from '../config/environment';

const API_BASE = config.API_BASE_URL;

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export interface SalesCall {
  id: number;
  customerId: number;
  audioFilePath: string;
  transcript?: string;
  urgencyScore?: number;
  budgetScore?: number;
  interestScore?: number;
  engagementScore?: number;
  overallScore?: number;
  analysisNotes?: string;
  // Enhanced analysis fields
  sentimentScore?: number;
  conversationPhases?: any;
  speakerAnalysis?: any;
  objectionAnalysis?: any;
  contextInsights?: any;
  analysisConfidence?: number;
  enhancedNotes?: string;
  analysisVersion?: string;
  gpt4AnalysisUsed?: boolean;
  createdAt: string;
  customer: Customer;
}

export interface DashboardStats {
  overview: {
    totalCustomers: number;
    totalSalesCalls: number;
    totalAnalyzed: number;
    totalScored: number;
    recentActivity: number;
  };
  scores: {
    avgUrgency: number;
    avgBudget: number;
    avgInterest: number;
    avgEngagement: number;
    avgOverall: number;
  };
  efficiency: {
    processingEfficiency: number;
    scoringEfficiency: number;
  };
}

export interface ScoringAnalytics {
  totalScoredCalls: number;
  averageOverallScore: number;
  scoreDistribution: {
    high: number;
    good: number;
    medium: number;
    low: number;
  };
  categoryAverages: {
    urgency: number;
    budget: number;
    interest: number;
    engagement: number;
  };
  topPerformers: Array<{
    customerId: number;
    customerName: string;
    avgScore: number;
    totalCalls: number;
  }>;
  improvementAreas: Array<{
    category: string;
    averageScore: number;
    recommendation: string;
  }>;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    salesCallId: number;
    customer: Customer;
    file?: {
      originalName: string;
      size: number;
      mimetype: string;
      path: string;
    };
    transcription?: {
      text: string;
      duration: number;
      wordCount: number;
    };
    scoring?: {
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
        notes: string;
        confidence: number;
      };
      metadata: {
        duration: number;
        wordCount: number;
        wordsPerMinute: number;
      };
    };
    analysisStatus?: string;
    scoringStatus?: string;
    analysisError?: string;
    uploadedAt: string;
  };
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  data: {
    salesCallId: number;
    customer: Customer;
    transcription: {
      text: string;
      duration: number;
      wordCount: number;
    };
    scoring: {
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
        notes: string;
        confidence: number;
      };
      metadata: {
        duration: number;
        wordCount: number;
        wordsPerMinute: number;
      };
    };
    analysisStatus: string;
    scoringStatus: string;
  };
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      console.log(`🌐 API Request: ${API_BASE}${endpoint}`);
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`💥 API Request Failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Dashboard
  getDashboardStats = async (): Promise<{ success: boolean; data: DashboardStats }> => {
    return this.request('/dashboard/stats');
  }

  getScoringAnalytics = async (): Promise<{ success: boolean; data: ScoringAnalytics }> => {
    return this.request('/dashboard/scoring-analytics');
  }

  // Upload
  uploadFile = async (formData: FormData): Promise<UploadResponse> => {
    try {
      console.log('📤 Upload Request: Starting file upload');
      
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log(`📡 Upload Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Upload Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Upload Success:', data);
      return data;
    } catch (error) {
      console.error('💥 Upload Request Failed:', error);
      throw error;
    }
  }

  // Analysis
  analyzeFile = async (salesCallId: number): Promise<AnalysisResponse> => {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ salesCallId }),
    });
  }

  getAnalysis = async (salesCallId: number): Promise<{ success: boolean; data: SalesCall }> => {
    return this.request(`/analyze/${salesCallId}`);
  }

  getAllAnalyses = async (): Promise<{ success: boolean; data: { analyses: SalesCall[] } }> => {
    return this.request('/analyze');
  }

  retryAnalysis = async (salesCallId: number): Promise<AnalysisResponse> => {
    return this.request(`/analyze/${salesCallId}/retry`, {
      method: 'POST',
    });
  }

  scoreTranscript = async (salesCallId: number): Promise<AnalysisResponse> => {
    return this.request(`/analyze/${salesCallId}/score`, {
      method: 'POST',
    });
  }

  // Customers
  getCustomers = async (): Promise<{ success: boolean; data: { customers: Customer[] } }> => {
    return this.request('/customers');
  }

  getCustomer = async (id: number): Promise<{ success: boolean; data: Customer }> => {
    return this.request(`/customers/${id}`);
  }

  // Audio
  getAudioUrl = (salesCallId: number): string => {
    return `${API_BASE}/audio/${salesCallId}`;
  }

  // Optional: Audio metadata endpoint for future use
  getAudioMetadata = async (salesCallId: number) => {
    return this.request(`/audio/metadata/${salesCallId}`);
  }

  // Configuration
  getConfiguration = async (): Promise<{ success: boolean; data: any }> => {
    return this.request('/configuration');
  }

  createConfiguration = async (config: any): Promise<{ success: boolean; data: any }> => {
    return this.request('/configuration', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  updateConfiguration = async (id: number, config: any): Promise<{ success: boolean; data: any }> => {
    return this.request(`/configuration/${id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  deleteConfiguration = async (id: number): Promise<{ success: boolean; data: any }> => {
    return this.request(`/configuration/${id}`, {
      method: 'DELETE',
    });
  }

  resetConfiguration = async (): Promise<{ success: boolean; data: any }> => {
    return this.request('/configuration/reset', {
      method: 'POST',
    });
  }

  // Health check
  healthCheck = async (): Promise<{ status: string }> => {
    return this.request('/health');
  }
}

export const apiService = new ApiService(); 