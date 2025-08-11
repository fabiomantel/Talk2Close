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
import Configuration from './pages/Configuration';
import Debug from './pages/Debug';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useDebugStatus } from './hooks/useDebugStatus';
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
  const { isEnabled: isDebugEnabled } = useDebugStatus();
  
  console.log('🚀 App Component: Initializing Hebrew Sales Call Analysis System');
  console.log('🌐 Environment:', config.ENVIRONMENT);
  console.log('🔗 API Base URL:', config.API_BASE_URL);
  console.log('🌍 Default Locale:', config.DEFAULT_LOCALE);
  console.log('📱 RTL Support:', config.RTL_SUPPORT);
  console.log('🐛 Debug Mode:', config.DEBUG_MODE);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50 rtl-layout">
            <DebugConfig />
            <Header />
            <div className="flex flex-row-reverse">
              <Sidebar />
              <main className="flex-1 p-6 rtl-main">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/configuration" element={<Configuration />} />
                  {isDebugEnabled && <Route path="/debug" element={<Debug />} />}
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
