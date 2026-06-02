import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../app/store';
import { googleAuthLogin } from '../store/authSlice';
import { useToast } from '../../../shared/components/ui/Toast';

export const GoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current) return;

    // Parse Google payload from hash fragment or query params
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    const token =
      hashParams.get('id_token') || searchParams.get('token') || hashParams.get('access_token');

    if (!token) {
      toast.error('Authentication credential was missing from the callback parameters.');
      navigate('/login');
      return;
    }

    const exchangeToken = async () => {
      hasTriggeredRef.current = true;
      const result = await dispatch(googleAuthLogin(token));

      if (googleAuthLogin.fulfilled.match(result)) {
        toast.success('Successfully logged in via Google OAuth!');
        navigate('/');
      } else {
        toast.error((result.payload as string) || 'Google authentication failed.');
        navigate('/login');
      }
    };

    exchangeToken();
  }, [dispatch, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      <h2 className="text-xl font-bold font-display text-white tracking-tight">
        Verifying Credentials
      </h2>
      <p className="text-muted-foreground font-sans text-xs">
        Exchanging Google assertions and establishing session credentials...
      </p>
    </div>
  );
};

export default GoogleCallbackPage;
