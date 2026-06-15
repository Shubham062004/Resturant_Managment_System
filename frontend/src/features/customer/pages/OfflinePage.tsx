import { WifiOff, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';

export const OfflinePage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/';
    }
  };

  return (
    <>
      <SEO
        title="Offline Mode"
        description="Check your network connection to access ABC outposts and smart menus."
      />

      <div className="text-center space-y-6 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground mx-auto">
          <WifiOff size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-extrabold text-white">
            {isOnline ? 'Connection Restored' : 'No Connection'}
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {isOnline
              ? 'Your browser detected an active network signal. You can now reload to return to operations.'
              : 'Your device is disconnected from the ABC core network. Check your cellular or Wi-Fi configurations.'}
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRetry}
            className="flex items-center gap-1.5 mx-auto text-xs"
          >
            <RefreshCw size={12} />
            <span>Verify Connection</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default OfflinePage;
