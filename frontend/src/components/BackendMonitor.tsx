import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import NotFoundPage from '../features/customer/pages/NotFoundPage';
import apiClient from '../services/apiClient';

interface BackendMonitorProps {
  children: React.ReactNode;
}

const BackendMonitor: React.FC<BackendMonitorProps> = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.get('/ping', {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="relative flex flex-col items-center">
          {/* Subtle Glow Effect */}
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isBackendOnline) {
    console.error('404 Bad Request - Backend connection failed.');
    // Render the NotFoundPage directly wrapped in a BrowserRouter to provide the routing context
    return (
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );
  }

  return <>{children}</>;
};

export default BackendMonitor;
