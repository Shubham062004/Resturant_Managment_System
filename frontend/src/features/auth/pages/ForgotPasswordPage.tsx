import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../../shared/layouts/AuthLayout';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import Alert from '../../../shared/components/ui/Alert';
import apiClient from '../../../services/apiClient';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setError('Email is required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setSuccessMessage(
        response.data.message || 'If registered, a password reset link has been dispatched.',
      );
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      brandTitle="Credential Recovery"
      brandDescription="Initiate the secure reset sequence to update your Oven Xpress system passwords and node access credentials."
    >
      <div className="glass-panel p-8 rounded-xl border border-border/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-white">
            Recover Password
          </h2>
          <p className="text-muted-foreground font-sans text-sm">
            Request secure reset credentials
          </p>
        </div>

        {error && (
          <Alert variant="error" title="Recovery Interrupted">
            {error}
          </Alert>
        )}

        {successMessage ? (
          <div className="space-y-6 text-center">
            <Alert variant="success" title="Dispatch Completed">
              {successMessage}
            </Alert>
            <p className="text-muted-foreground font-sans text-sm leading-relaxed px-1">
              Please check your system logs or email inbox. The reset link is valid for exactly 1
              hour.
            </p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-semibold font-display py-2.5 rounded-lg transition-all"
            >
              <ArrowLeft size={16} /> Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Registered Email Address"
              placeholder="staff@ovenxpress.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              prefixIcon={<Mail size={16} />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              isLoading={isLoading}
              leftIcon={<Send size={16} />}
            >
              Dispatch Reset Link
            </Button>

            <div className="text-center font-sans text-sm">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-primary hover:text-accent font-semibold transition-colors duration-150"
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
