import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { login, clearError } from '../store/authSlice';
import AuthLayout from '../../../shared/layouts/AuthLayout';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import Alert from '../../../shared/components/ui/Alert';
import { Mail, Phone, Lock, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { authStatus, error } = useAppSelector((state) => state.auth);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleMethodChange = (method: 'email' | 'phone') => {
    setLoginMethod(method);
    setValidationError(null);
    dispatch(clearError());
  };

  const handleGoogleLogin = () => {
    // In local development, redirect with a mock token to trigger auto-verify
    const redirectUrl = `/auth/callback/google#id_token=mock-google-user@ovenxpress.com`;
    navigate(redirectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    dispatch(clearError());

    // Basic Validation
    if (loginMethod === 'email') {
      if (!email) {
        setValidationError('Email is required.');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setValidationError('Invalid email address format.');
        return;
      }
    } else {
      if (!phone) {
        setValidationError('Phone number is required.');
        return;
      }
      if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
        setValidationError('Invalid phone number format. Include country code (e.g. +1234567890).');
        return;
      }
    }

    if (!password) {
      setValidationError('Password is required.');
      return;
    }

    const payload: Record<string, string> =
      loginMethod === 'email' ? { email, password } : { phone, password };

    const result = await dispatch(login(payload));
    if (login.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthLayout
      brandTitle="Terminal Verification"
      brandDescription="Authenticate using your enterprise credentials to access the Oven Xpress floor plans and point-of-sale grids."
    >
      <div className="glass-panel p-8 rounded-xl border border-border/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-white">
            Staff Portal
          </h2>
          <p className="text-muted-foreground font-sans text-sm">
            Unlock your secure system terminal
          </p>
        </div>

        {/* Login Method Toggle Tab */}
        <div className="flex bg-secondary p-1 rounded-lg border border-border/40">
          <button
            type="button"
            onClick={() => handleMethodChange('email')}
            className={`flex-1 py-2 font-display text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-200 ${
              loginMethod === 'email'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => handleMethodChange('phone')}
            className={`flex-1 py-2 font-display text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-200 ${
              loginMethod === 'phone'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Phone Login
          </button>
        </div>

        {/* Errors notifications */}
        {(validationError || error) && (
          <Alert variant="error" title="Authentication Blocked">
            {validationError || error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {loginMethod === 'email' ? (
            <Input
              type="email"
              label="Email Address"
              placeholder="staff@ovenxpress.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              prefixIcon={<Mail size={16} />}
              required
            />
          ) : (
            <Input
              type="text"
              label="Phone Number"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              prefixIcon={<Phone size={16} />}
              required
            />
          )}

          <div className="space-y-1">
            <Input
              type="password"
              label="Secret Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefixIcon={<Lock size={16} />}
              required
            />
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:text-accent font-semibold transition-colors duration-150"
              >
                Forgot credentials?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            isLoading={authStatus === 'loading'}
            leftIcon={<LogIn size={18} />}
          >
            Verify Credentials
          </Button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border/40"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase font-semibold font-display tracking-widest">
            or continue with
          </span>
          <div className="flex-grow border-t border-border/40"></div>
        </div>

        {/* Google OAuth Login Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-3 border border-border/80 text-white hover:bg-secondary/40 font-semibold"
          onClick={handleGoogleLogin}
        >
          <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          Google Enterprise ID
        </Button>

        <div className="text-center font-sans text-sm text-muted-foreground">
          New system handler?{' '}
          <Link
            to="/register"
            className="text-primary hover:text-accent font-semibold transition-colors duration-150"
          >
            Register account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
