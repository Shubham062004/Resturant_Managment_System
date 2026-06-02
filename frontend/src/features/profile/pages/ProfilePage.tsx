import React, { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { updateProfile, logoutAllDevices } from '../../auth/store/authSlice';
import { useToast } from '../../../shared/components/ui/Toast';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import Avatar from '../../../shared/components/ui/Avatar';
import Badge from '../../../shared/components/ui/Badge';
import Alert from '../../../shared/components/ui/Alert';
import { User as UserIcon, Phone, Save, ShieldAlert, ShieldCheck, Camera, LogOut } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setValidationError('Invalid image format. Allowed formats: JPEG, PNG, WEBP, GIF.');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('File is too large. Maximum allowed size is 5MB.');
      return;
    }

    setValidationError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setIsLoading(true);

    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('First name and last name are required.');
      setIsLoading(false);
      return;
    }

    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      setValidationError('Invalid phone number format. Use E.164 standard (e.g. +1234567890).');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      formData.append('phone', phone.trim());
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const result = await dispatch(updateProfile(formData));
      if (updateProfile.fulfilled.match(result)) {
        toast.success('Your profile details have been saved successfully.');
        setAvatarFile(null);
      } else {
        setValidationError((result.payload as string) || 'Failed to update profile.');
      }
    } catch (err) {
      setValidationError('An unexpected error occurred while saving your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to terminate all active sessions on other devices? You will be signed out from this client.')) {
      await dispatch(logoutAllDevices());
      toast.success('All active sessions revoked.');
      window.location.href = '/login';
    }
  };

  // Base URL mapping for images
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (!user.avatar) return undefined;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `${apiBaseUrl}${user.avatar}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-white">Profile Node Settings</h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">Manage system configurations and operational clearances.</p>
      </div>

      {validationError && (
        <Alert variant="danger" title="Save Refused">
          {validationError}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Metadata Info */}
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center text-center space-y-6">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar
              src={getAvatarSrc()}
              name={`${user.firstName} ${user.lastName}`}
              size="xl"
              className="w-24 h-24 text-2xl border-2 border-primary/50 group-hover:opacity-75 transition-opacity"
            />
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white shadow-md border border-border/80 group-hover:scale-105 transition-transform">
              <Camera size={14} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-white">{`${user.firstName} ${user.lastName}`}</h2>
            <p className="text-xs text-muted-foreground font-sans">{user.email}</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="primary" className="text-[10px] py-1 font-display">{user.role}</Badge>
            {user.isEmailVerified ? (
              <Badge variant="success" className="text-[10px] py-1 flex items-center gap-1">
                <ShieldCheck size={10} /> Verified
              </Badge>
            ) : (
              <Badge variant="warning" className="text-[10px] py-1 flex items-center gap-1">
                <ShieldAlert size={10} /> Unverified Email
              </Badge>
            )}
          </div>

          <div className="w-full border-t border-border/40 my-2" />

          {/* Device Actions Panel */}
          <div className="w-full space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-left">Terminal Security</h3>
            <button
              onClick={handleLogoutAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-danger/40 hover:bg-danger/10 text-danger text-xs font-semibold transition-colors duration-150"
            >
              <LogOut size={14} /> Kill Other Device Sessions
            </button>
          </div>
        </div>

        {/* Right Column: Update Forms Panel */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-xl">
          <h2 className="text-xl font-bold font-display text-white mb-6 border-b border-border/40 pb-4">Personal Details</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                prefixIcon={<UserIcon size={16} />}
                required
              />
              <Input
                type="text"
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                prefixIcon={<UserIcon size={16} />}
                required
              />
            </div>

            <Input
              type="email"
              label="Email Address (System ID)"
              value={user.email}
              disabled
              prefixIcon={<UserIcon size={16} />}
              helperText="Your system email address cannot be edited."
            />

            <Input
              type="text"
              label="Phone Number"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              prefixIcon={<Phone size={16} />}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<Save size={16} />}
                className="px-6 py-2.5"
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
