import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { Flame, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Page Not Found (404)"
        description="The requested page could not be located in our restaurant management database."
      />

      <div className="text-center space-y-6 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto animate-bounce">
          <Flame size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-display font-extrabold text-white">404 - Node Offline</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            The coordinates you input do not match any active menu, branch, or user route in Oven
            Xpress.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 mx-auto text-xs"
          >
            <ArrowLeft size={14} />
            <span>Return to HQ</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
