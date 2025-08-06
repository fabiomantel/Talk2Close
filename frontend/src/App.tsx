import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/environment';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Customers from './pages/Customers';
import Analysis from './pages/Analysis';
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
        top: 0, 
        right: 0, 
        background: '#f0f0f0', 
        padding: '10px', 
        fontSize: '12px', 
        zIndex: 9999,
        maxWidth: '300px'
      }}>
        <strong>🔧 Debug Config:</strong><br/>
        API: {config.API_BASE_URL}<br/>
        Backend: {config.BACKEND_URL}<br/>
        Env: {config.ENVIRONMENT}
      </div>
    );
  }
  return null;
};

function App() {
  console.log('🚀 App Component: Initializing Hebrew Sales Call Analysis System');
  console.log('🌐 Environment:', config.ENVIRONMENT);
  console.log('🔗 API Base URL:', config.API_BASE_URL);
  console.log('🌍 Default Locale:', config.DEFAULT_LOCALE);
  console.log('📱 RTL Support:', config.RTL_SUPPORT);

  return (
    <ErrorBoundary>
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
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
