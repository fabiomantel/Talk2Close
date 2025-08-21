import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/environment';
import { LanguageProvider } from './i18n/context/LanguageProvider';
import './i18n/config/i18n'; // Ensure i18n is initialized
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Customers from './pages/Customers';
import Analysis from './pages/Analysis';
import Configuration from './pages/Configuration';
import BatchProcessing from './pages/BatchProcessing';
import Debug from './pages/Debug';
import ErrorBoundary from './components/common/ErrorBoundary';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

// Debug component to show current configuration
const DebugConfig = () => {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0, 
        background: '#f0f0f0', 
        padding: '10px', 
        fontSize: '12px', 
        zIndex: 9999,
        maxWidth: '300px',
        borderTop: '1px solid #ccc',
        borderLeft: '1px solid #ccc'
      }}>
        <strong>🔧 Debug Config:</strong><br/>
        API: {config.API_BASE_URL}<br/>
        Backend: {config.BACKEND_URL}<br/>
        Env: {config.ENVIRONMENT}<br/>
        Debug: {config.DEBUG_MODE ? 'Enabled' : 'Disabled'}
      </div>
    );
  }
  return null;
};

function App() {
  const isDebugEnabled = config.DEBUG_MODE;
  
  console.log('🚀 App Component: Initializing Hebrew Sales Call Analysis System');
  console.log('🌐 Environment:', config.ENVIRONMENT);
  console.log('🔗 API Base URL:', config.API_BASE_URL);
  console.log('🌍 Default Locale:', config.DEFAULT_LOCALE);
  console.log('📱 RTL Support:', config.RTL_SUPPORT);
  console.log('🐛 Debug Mode:', config.DEBUG_MODE);

  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <LanguageProvider defaultLanguage="he">
          <QueryClientProvider client={queryClient}>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <DebugConfig />
                <Header />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/analysis" element={<Analysis />} />
                      <Route path="/configuration" element={<Configuration />} />
                      <Route path="/batch" element={<BatchProcessing />} />
                      {isDebugEnabled && <Route path="/debug" element={<Debug />} />}
                    </Routes>
                  </main>
                </div>
              </div>
            </Router>
          </QueryClientProvider>
        </LanguageProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
