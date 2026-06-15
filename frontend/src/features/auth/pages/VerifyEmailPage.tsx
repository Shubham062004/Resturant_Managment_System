import { Mail, CheckCircle2, AlertOctagon, ArrowLeft, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

import apiClient from '../../../services/apiClient';
import Alert from '../../../shared/components/ui/Alert';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import AuthLayout from '../../../shared/layouts/AuthLayout';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'idle',
  );
  const [message, setMessage] = useState<string | null>(null);

  // Resend Verification Form State
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const response = await apiClient.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(
          err.response?.data?.error?.message || 'Verification token is invalid or has expired.',
        );
      }
    };

    verifyToken();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setResendLoading(true);
    setResendStatus(null);

    try {
      const response = await apiClient.post('/auth/resend-verification', { email });
      setResendStatus({
        type: 'success',
        msg: response.data.message || 'Verification link resent.',
      });
    } catch (err: any) {
      setResendStatus({
        type: 'error',
        msg: err.response?.data?.error?.message || 'Failed to dispatch verification link.',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
            <p className="text-white font-semibold font-display">Verifying account signatures...</p>
            <p className="text-muted-foreground font-sans text-xs">
              Communicating verification updates to primary relational ledger
            </p>
          </div>
        );
      case 'success':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle2 size={50} className="text-success animate-pulse" />
            </div>
            <Alert variant="success" title="Verification Succeeded">
              {message}
            </Alert>
            <p className="text-muted-foreground font-sans text-sm leading-relaxed px-1">
              Your email profile has been linked and certified. You can now log in to the terminal
              and access authorized dashboards.
            </p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-semibold font-display py-2.5 rounded-lg transition-all"
            >
              Unlock Terminal
            </Link>
          </div>
        );
      case 'error':
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <AlertOctagon size={50} className="text-danger" />
            </div>
            <Alert variant="error" title="Verification Refused">
              {message}
            </Alert>
            <div className="border-t border-border/40 my-4" />
            <h3 className="text-white font-display font-semibold text-sm text-center">
              Request New Verification Link
            </h3>

            {resendStatus && (
              <Alert
                variant={resendStatus.type === 'success' ? 'success' : 'error'}
                title={resendStatus.type === 'success' ? 'Link Sent' : 'Request Refused'}
              >
                {resendStatus.msg}
              </Alert>
            )}

            <form onSubmit={handleResend} className="space-y-3">
              <Input
                type="email"
                label="Registered Email Address"
                placeholder="staff@abc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                prefixIcon={<Mail size={16} />}
                required
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                isLoading={resendLoading}
                leftIcon={<RefreshCw size={16} />}
              >
                Resend Verification Link
              </Button>
            </form>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground font-sans text-sm leading-relaxed text-center">
              Please enter your registered email address to receive a verification link containing
              system activation signatures.
            </p>

            {resendStatus && (
              <Alert
                variant={resendStatus.type === 'success' ? 'success' : 'error'}
                title={resendStatus.type === 'success' ? 'Link Sent' : 'Request Refused'}
              >
                {resendStatus.msg}
              </Alert>
            )}

            <form onSubmit={handleResend} className="space-y-4">
              <Input
                type="email"
                label="Registered Email Address"
                placeholder="staff@abc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                prefixIcon={<Mail size={16} />}
                required
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                isLoading={resendLoading}
                leftIcon={<RefreshCw size={16} />}
              >
                Send Verification Link
              </Button>
            </form>
          </div>
        );
    }
  };

  return (
    <AuthLayout
      brandTitle="Email Verification"
      brandDescription="Link your email profile and certify identity credentials to unlock POS and table grid operational permissions."
    >
      <div className="glass-panel p-8 rounded-xl border border-border/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-white">
            Verify Email
          </h2>
          <p className="text-muted-foreground font-sans text-sm">
            Certify system authorization credentials
          </p>
        </div>

        {renderContent()}

        {status !== 'verifying' && (
          <div className="text-center font-sans text-sm mt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-primary hover:text-accent font-semibold transition-colors duration-150"
            >
              <ArrowLeft size={14} /> Return to Login
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
