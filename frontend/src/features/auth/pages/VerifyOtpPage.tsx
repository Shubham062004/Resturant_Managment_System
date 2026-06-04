import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { verifyOtp, clearError } from '../store/authSlice';
import { getDashboardRouteByRole } from '../utils/roleRouting';
import AuthLayout from '../../../shared/layouts/AuthLayout';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import Alert from '../../../shared/components/ui/Alert';
import { ShieldCheck } from 'lucide-react';

export const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { authStatus, error } = useAppSelector((state) => state.auth);

  const identifier = location.state?.email || location.state?.phone;

  useEffect(() => {
    if (!identifier) {
      navigate('/login', { replace: true });
    }
  }, [identifier, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    dispatch(clearError());

    if (!otp || otp.length !== 6) {
      setValidationError('Please enter a valid 6-digit OTP.');
      return;
    }

    const payload = location.state?.email
      ? { email: location.state.email, otp, type: 'LOGIN' }
      : { phone: location.state.phone, otp, type: 'LOGIN' };

    const result = await dispatch(verifyOtp(payload as any));
    if (verifyOtp.fulfilled.match(result)) {
      const from = location.state?.from || '/';
      const dashboardRoute = getDashboardRouteByRole(result.payload.user?.role);
      const destination = from === '/' ? dashboardRoute : from;
      navigate(destination, { replace: true });
    }
  };

  return (
    <AuthLayout
      brandTitle="Two-Factor Authentication"
      brandDescription="Staff members are required to verify their identity via One-Time Password."
    >
      <div className="glass-panel p-8 rounded-xl border border-border/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-white">
            Security Check
          </h2>
          <p className="text-muted-foreground font-sans text-sm">
            Enter the 6-digit code sent to {identifier}
          </p>
        </div>

        {(validationError || error) && (
          <Alert variant="error" title="Verification Failed">
            {validationError || error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="One-Time Password"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            prefixIcon={<ShieldCheck size={16} />}
            required
            maxLength={6}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            isLoading={authStatus === 'loading'}
          >
            Verify & Authenticate
          </Button>
        </form>

        <div className="text-center font-sans text-sm text-muted-foreground">
          <Link
            to="/login"
            className="text-primary hover:text-accent font-semibold transition-colors duration-150"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOtpPage;
