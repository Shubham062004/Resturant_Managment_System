import { ShieldAlert, RefreshCw } from 'lucide-react';
import React from 'react';

import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';

export const ServerErrorPage: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <SEO
        title="Server Error (500)"
        description="The ABC main database or gateway is currently undergoing maintenance."
      />

      <div className="text-center space-y-6 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-danger/15 border border-danger/30 flex items-center justify-center text-danger mx-auto animate-pulse">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-extrabold text-white">
            500 - System Breach
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            The core server gateway failed to compile our orders catalog. Our
            team has been notified.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReload}
            className="flex items-center gap-1.5 mx-auto border-border/60 text-white hover:bg-secondary/40 text-xs"
          >
            <RefreshCw size={12} />
            <span>Retry Connection</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default ServerErrorPage;
