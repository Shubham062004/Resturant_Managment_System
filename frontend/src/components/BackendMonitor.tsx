import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

interface BackendMonitorProps {
  children: React.ReactNode;
}

const BackendMonitor: React.FC<BackendMonitorProps> = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.get('/health', {
          baseURL: import.meta.env.VITE_API_URL.replace('/api/v1', ''), // Override to use root
        });
        if (response.data.status === 'ok') {
          setIsBackendOnline(true);
        } else {
          setIsBackendOnline(false);
        }
      } catch (err) {
        setIsBackendOnline(false);
      }
    };

    checkHealth();
  }, []);

  if (isBackendOnline === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111827', color: 'white', fontFamily: 'sans-serif' }}>
        <h2>Connecting to Backend...</h2>
      </div>
    );
  }

  if (!isBackendOnline) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111827', color: '#f87171', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Backend Offline</h1>
        <p style={{ color: '#9ca3af' }}>Cannot reach the server at {import.meta.env.VITE_API_URL.replace('/api/v1', '')}. Please ensure the backend is running.</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default BackendMonitor;
