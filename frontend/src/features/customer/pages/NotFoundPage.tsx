import { ArrowLeft, SearchX } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Page Not Found | ABC Restaurant"
        description="The page you are looking for does not exist."
      />

      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
        <div className="space-y-4 max-w-md">
          <h1 className="text-6xl font-display font-black text-foreground">
            404
          </h1>
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground text-base leading-relaxed pb-6">
            We're sorry, but the page you are looking for doesn't exist, has
            been removed, or is temporarily unavailable.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft size={18} />}
        >
          Return Home
        </Button>
      </div>
    </>
  );
};

export default NotFoundPage;
