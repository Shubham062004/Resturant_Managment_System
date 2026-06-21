import { Lock, LogIn, User } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import Alert from '../../../shared/components/ui/Alert';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import AuthLayout from '../../../shared/layouts/AuthLayout';
import { login, clearError } from '../store/authSlice';
import { getDashboardRouteByRole } from '../utils/roleRouting';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { authStatus, error } = useAppSelector((state) => state.auth);

  const from = (location.state as any)?.from?.pathname;
  const fromState = (location.state as any)?.from?.state;

  const handleGoogleLogin = () => {
    const apiUrl =
      import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    dispatch(clearError());

    if (!identifier) {
      setValidationError('Email or Phone Number is required.');
      return;
    }

    let isEmail = false;
    let payload: Record<string, string> = {};

    // Determine if input is email or phone
    if (identifier.includes('@')) {
      isEmail = true;
      if (!/\S+@\S+\.\S+/.test(identifier)) {
        setValidationError('Invalid email address format.');
        return;
      }
      payload = { email: identifier, password };
    } else {
      // Check if it's a valid 10-digit phone number
      const digitsOnly = identifier.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        setValidationError(
          'Please enter a valid email or a 10-digit phone number.'
        );
        return;
      }
      payload = { phone: digitsOnly, password };
    }

    if (!password) {
      setValidationError('Password is required.');
      return;
    }

    const result = await dispatch(login(payload));
    if (login.fulfilled.match(result)) {
      if (result.payload.requireOtp) {
        navigate('/verify-login-otp', {
          state: {
            email: result.payload.email,
            phone: result.payload.phone,
            from: from,
            fromState: fromState,
          },
        });
      } else {
        // Automatically determine redirect path based on user role if 'from' is undefined or root
        const dashboardRoute = getDashboardRouteByRole(
          result.payload.user?.role
        );
        const destination = !from || from === '/login' ? dashboardRoute : from;
        navigate(destination, { state: fromState, replace: true });
      }
    }
  };

  const GoogleIcon = (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
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
  );

  return (
    <AuthLayout>
      <div className="bg-card p-8 md:p-10 rounded-2xl shadow-xl border border-border/40 w-full animate-fade-in">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Welcome Back
          </h2>
          <p className="text-muted-foreground font-sans text-sm">
            Sign in to continue to your account
          </p>
        </div>

        {/* Errors notifications */}
        {(validationError || error) && (
          <div className="mb-6">
            <Alert variant="error" title="Oops!">
              {validationError || error}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            label="Email or Phone Number"
            placeholder="you@example.com or 1234567890"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            prefixIcon={<User size={16} />}
            required
          />

          <div className="space-y-2">
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefixIcon={<Lock size={16} />}
              required
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-hover font-semibold transition-colors duration-150"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 mt-4"
            isLoading={authStatus === 'loading'}
            leftIcon={<LogIn size={18} />}
          >
            Login
          </Button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase font-semibold tracking-wider">
            Or
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Google OAuth Login Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full py-2.5"
          onClick={handleGoogleLogin}
          leftIcon={GoogleIcon}
        >
          Continue with Google
        </Button>

        <div className="text-center font-sans text-sm text-muted-foreground pt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-primary hover:text-primary-hover font-semibold transition-colors duration-150"
          >
            Register
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
