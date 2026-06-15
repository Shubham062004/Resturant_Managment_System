import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import apiClient from '../../../services/apiClient';
import Alert from '../../../shared/components/ui/Alert';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import AuthLayout from '../../../shared/layouts/AuthLayout';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Reset token is missing in the URL query params. Please verify your link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/reset-password', { token, password });
      toast.success(response.data.message || 'Password updated successfully!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      brandTitle="Terminal Verification"
      brandDescription="Establish a new secure system access password on your employee account node to re-enable operational credentials."
    >
      <div className="glass-panel p-8 rounded-xl border border-border/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-white">
            Reset Password
          </h2>
          <p className="text-muted-foreground font-sans text-sm">Save new system credentials</p>
        </div>

        {error && (
          <Alert variant="error" title="Verification Failed">
            {error}
          </Alert>
        )}

        {!token ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground font-sans text-sm">
              The reset token parameters are missing from your URL. Request a new password recovery
              link.
            </p>
            <Link
              to="/forgot-password"
              className="w-full inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-semibold font-display py-2.5 rounded-lg transition-all"
            >
              Request Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              label="New Security Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefixIcon={<Lock size={16} />}
              required
            />

            <Input
              type="password"
              label="Confirm New Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              prefixIcon={<Lock size={16} />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              isLoading={isLoading}
              leftIcon={<KeyRound size={18} />}
            >
              Update Security Credentials
            </Button>
          </form>
        )}

        <div className="text-center font-sans text-sm">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-primary hover:text-accent font-semibold transition-colors duration-150"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
