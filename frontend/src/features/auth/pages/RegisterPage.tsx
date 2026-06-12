import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { registerUser, clearError } from '../store/authSlice';
import AuthLayout from '../../../shared/layouts/AuthLayout';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import Alert from '../../../shared/components/ui/Alert';
import { useToast } from '../../../shared/components/ui/Toast';
import { Mail, Phone, Lock, User as UserIcon, UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role] = useState('CUSTOMER');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { authStatus, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    dispatch(clearError());

    // Standard client side verification
    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('First name and last name are required.');
      return;
    }
    if (!email.trim()) {
      setValidationError('Email address is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Invalid email address format.');
      return;
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      setValidationError('Phone number must be exactly 10 digits.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    const payload = {
      email,
      firstName,
      lastName,
      password,
      role,
      ...(phone ? { phone } : {}),
    };

    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful! Check your email for verification.');
      navigate('/login');
    }
  };

  const handleGoogleLogin = () => {
    const redirectUrl = `/auth/callback/google#id_token=mock-google-user@abc.com`;
    navigate(redirectUrl);
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
            Create an Account
          </h2>
          <p className="text-muted-foreground font-sans text-sm">Sign up to get started</p>
        </div>

        {(validationError || error) && (
          <div className="mb-6">
            <Alert variant="error" title="Oops!">
              {validationError || error}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              label="First Name"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              prefixIcon={<UserIcon size={16} />}
              required
            />
            <Input
              type="text"
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              prefixIcon={<UserIcon size={16} />}
              required
            />
          </div>

          <Input
            type="email"
            label="Email Address"
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefixIcon={<Mail size={16} />}
            required
          />

          <Input
            type="text"
            label="Phone Number (Optional)"
            placeholder="1234567890"
            value={phone}
            maxLength={10}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPhone(val);
            }}
            prefixIcon={<Phone size={16} />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefixIcon={<Lock size={16} />}
              required
            />
            <Input
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              prefixIcon={<Lock size={16} />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 mt-2"
            isLoading={authStatus === 'loading'}
            leftIcon={<UserPlus size={18} />}
          >
            Create Account
          </Button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase font-semibold tracking-wider">
            Or
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full py-2.5"
          onClick={handleGoogleLogin}
          leftIcon={GoogleIcon}
        >
          Sign up with Google
        </Button>

        <div className="text-center font-sans text-sm text-muted-foreground pt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-primary-hover font-semibold transition-colors duration-150"
          >
            Log in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
