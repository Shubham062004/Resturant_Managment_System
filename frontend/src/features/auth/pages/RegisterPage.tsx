import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { registerUser, clearError } from '../store/authSlice';
import AuthLayout from '../../../shared/layouts/AuthLayout';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import Alert from '../../../shared/components/ui/Alert';
import Select from '../../../shared/components/ui/Select';
import { useToast } from '../../../shared/components/ui/Toast';
import { Mail, Phone, Lock, User as UserIcon, UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { authStatus, error } = useAppSelector((state) => state.auth);

  const roleOptions = [
    { label: 'Customer', value: 'CUSTOMER' },
    { label: 'Administrator', value: 'ADMIN' },
    { label: 'Kitchen Staff', value: 'KITCHEN_STAFF' },
    { label: 'Delivery Partner', value: 'DELIVERY_PARTNER' },
    { label: 'Cashier / Front House', value: 'CASHIER' },
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
  ];

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
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      setValidationError('Invalid phone number format. Use E.164 format (e.g. +1234567890).');
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
      toast.success('Registration successful! Check your logs/email for a verification link.');
      navigate('/login');
    }
  };

  return (
    <AuthLayout
      brandTitle="Terminal Onboarding"
      brandDescription="Register your employee profile node to configure authorizations for the Point of Sale terminals and Kitchen Display systems."
    >
      <div className="glass-panel p-8 rounded-xl border border-border/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-white">
            Register Account
          </h2>
          <p className="text-muted-foreground font-sans text-sm">Setup your system access node</p>
        </div>

        {(validationError || error) && (
          <Alert variant="danger" title="Registration Refused">
            {validationError || error}
          </Alert>
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
              placeholder="Cook"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              prefixIcon={<UserIcon size={16} />}
              required
            />
          </div>

          <Input
            type="email"
            label="Email Address"
            placeholder="jane.cook@ovenxpress.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefixIcon={<Mail size={16} />}
            required
          />

          <Input
            type="text"
            label="Phone Number (Optional)"
            placeholder="+1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            prefixIcon={<Phone size={16} />}
          />

          <Select
            label="System Role"
            options={roleOptions}
            value={role}
            onChange={(val) => setRole(val as string)}
          />

          <Input
            type="password"
            label="Security Password"
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

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            isLoading={authStatus === 'loading'}
            leftIcon={<UserPlus size={18} />}
          >
            Create Profile Node
          </Button>
        </form>

        <div className="text-center font-sans text-sm text-muted-foreground">
          Already registered?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-accent font-semibold transition-colors duration-150"
          >
            Unlock terminal
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
