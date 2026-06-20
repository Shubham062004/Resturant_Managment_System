import {
  User as UserIcon,
  Phone,
  Save,
  ShieldAlert,
  ShieldCheck,
  Camera,
  LogOut,
  Heart,
  Bookmark,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import Alert from '../../../shared/components/ui/Alert';
import Avatar from '../../../shared/components/ui/Avatar';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import { updateProfile, logoutAllDevices } from '../../auth/store/authSlice';
import { useWishlistSummary } from '../../../api/hooks/useWishlist';

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
      setValidationError(
        'Invalid image format. Allowed formats: JPEG, PNG, WEBP, GIF.'
      );
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
      setValidationError(
        'Invalid phone number format. Use E.164 standard (e.g. +1234567890).'
      );
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
        setValidationError(
          (result.payload as string) || 'Failed to update profile.'
        );
      }
    } catch (err) {
      setValidationError(
        'An unexpected error occurred while saving your details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (
      window.confirm(
        'Are you sure you want to terminate all active sessions on other devices? You will be signed out from this client.'
      )
    ) {
      await dispatch(logoutAllDevices());
      toast.success('All active sessions revoked.');
      window.location.href = '/login';
    }
  };

  // Base URL mapping for images
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (!user.avatar) return undefined;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `${apiBaseUrl}${user.avatar}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-white">
          Profile Node Settings
        </h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Manage system configurations and operational clearances.
        </p>
      </div>

      {validationError && (
        <Alert variant="error" title="Save Refused">
          {validationError}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Metadata Info */}
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center text-center space-y-6">
          <div
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
          >
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
            <p className="text-xs text-muted-foreground font-sans">
              {user.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="info" className="text-[10px] py-1 font-display">
              {user.role}
            </Badge>
            {user.isEmailVerified ? (
              <Badge
                variant="success"
                className="text-[10px] py-1 flex items-center gap-1"
              >
                <ShieldCheck size={10} /> Verified
              </Badge>
            ) : (
              <Badge
                variant="warning"
                className="text-[10px] py-1 flex items-center gap-1"
              >
                <ShieldAlert size={10} /> Unverified Email
              </Badge>
            )}
          </div>

          <div className="w-full border-t border-border/40 my-2" />

          {/* Device Actions Panel */}
          <div className="w-full space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-left">
              Terminal Security
            </h3>
            <button
              onClick={handleLogoutAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-danger/40 hover:bg-danger/10 text-danger text-xs font-semibold transition-colors duration-150"
            >
              <LogOut size={14} /> Kill Other Device Sessions
            </button>
          </div>
        </div>

        {/* Right Column: Update Forms Panel & Optional Staff Stats */}
        <div className="lg:col-span-2 space-y-6">
          {user.role !== 'CUSTOMER' && (
            <div className="glass-panel p-8 rounded-xl space-y-6">
              <h2 className="text-xl font-bold font-display text-white border-b border-border/40 pb-4 flex items-center justify-between">
                <span>Staff Operations Portal</span>
                <Badge variant="info" className="text-xs">
                  Active Shift Partner
                </Badge>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                {/* Salary Card */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-border/20 text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Base Salary
                  </span>
                  <span className="text-2xl font-bold font-display text-slate-200 mt-2 block">
                    ₹{Number(user.salary || 25000).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Monthly standard pay
                  </span>
                </div>

                {/* Rating Bonus */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-border/20 text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Ratings Bonus
                  </span>
                  <span className="text-2xl font-bold font-display text-emerald-500 mt-2 block">
                    ₹
                    {Math.round(
                      (user.attendanceCount || 22) *
                        12 *
                        ((user.performanceScore || 4.7) / 5.0) *
                        5
                    ).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    ₹5 reward per 5★ rating
                  </span>
                </div>

                {/* Total Monthly Earnings */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-border/20 text-center bg-gradient-to-b from-primary/10 to-transparent">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block text-primary">
                    Total Earnings
                  </span>
                  <span className="text-2xl font-bold font-display text-primary mt-2 block">
                    ₹
                    {Math.round(
                      Number(user.salary || 25000) +
                        (user.attendanceCount || 22) *
                          12 *
                          ((user.performanceScore || 4.7) / 5.0) *
                          5
                    ).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Salary + performance bonus
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/20 text-sm font-sans">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Attendance Shifts:</span>
                    <span className="font-semibold text-slate-200">
                      {user.attendanceCount || 22} logged shifts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Performance Rating:</span>
                    <span className="font-semibold text-amber-400">
                      ⭐ {user.performanceScore || 4.7} / 5.0
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operations Role:</span>
                    <span className="font-semibold text-slate-200">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  {user.assignedCategory && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Station:</span>
                      <span className="font-semibold text-primary uppercase">
                        {user.assignedCategory}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {user.role === 'CUSTOMER' && (
            <WishlistSummaryCard />
          )}

          <div className="glass-panel p-8 rounded-xl">
            <h2 className="text-xl font-bold font-display text-white mb-6 border-b border-border/40 pb-4">
              Personal Details
            </h2>
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
    </div>
  );
};

const WishlistSummaryCard: React.FC = () => {
  const { data: summaryResponse, isLoading } = useWishlistSummary();
  const summary = summaryResponse?.data;

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-xl animate-pulse space-y-4">
        <div className="h-6 bg-white/5 rounded w-1/4 animate-pulse" />
        <div className="h-20 bg-white/5 rounded w-full animate-pulse" />
      </div>
    );
  }

  if (!summary || summary.count === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-6 rounded-xl space-y-6 font-sans text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
            <Heart size={16} className="fill-current" />
          </div>
          <h2 className="text-lg font-bold text-white font-display">My Wishlist Summary</h2>
        </div>
        <Link
          to="/wishlist"
          className="text-xs text-primary hover:text-primary-hover font-bold flex items-center gap-1 transition-all"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wishlist Count & Favorite Categories */}
        <div className="space-y-4">
          <div>
            <span className="text-xs text-neutral-400 block font-semibold uppercase tracking-wider">Wishlist Count</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">
              {summary.count} {summary.count === 1 ? 'item' : 'items'} saved
            </span>
          </div>

          {summary.favoriteCategories && summary.favoriteCategories.length > 0 && (
            <div>
              <span className="text-xs text-neutral-400 block font-semibold uppercase tracking-wider mb-2">Favorite Categories</span>
              <div className="flex flex-wrap gap-2">
                {summary.favoriteCategories.map((cat) => (
                  <span
                    key={cat.name}
                    className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl"
                  >
                    {cat.name} ({cat.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Most Saved Item */}
        {summary.mostSavedItem && (
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
            {summary.mostSavedItem.image && (
              <img
                src={summary.mostSavedItem.image}
                alt={summary.mostSavedItem.name}
                className="w-16 h-16 rounded-xl object-cover border border-white/5"
              />
            )}
            <div className="space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} fill="currentColor" /> Most Loved
              </span>
              <h4 className="font-bold text-white text-sm line-clamp-1">{summary.mostSavedItem.name}</h4>
              <p className="text-xs text-neutral-400 font-medium">Saved {summary.mostSavedItem.count} times</p>
            </div>
          </div>
        )}
      </div>

      {/* Recently Saved Items Grid */}
      {summary.recentlySaved && summary.recentlySaved.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-white/5">
          <span className="text-xs text-neutral-400 block font-semibold uppercase tracking-wider">Recently Saved Dishes</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary.recentlySaved.map((prod) => (
              <Link
                key={prod.id}
                to="/menu"
                className="bg-slate-950/20 border border-white/5 hover:border-white/10 rounded-2xl p-3 flex flex-col items-center text-center hover:scale-[1.02] transition-all group"
              >
                {prod.image ? (
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-12 h-12 rounded-xl object-cover mb-2 border border-white/5"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2 text-neutral-500">
                    <Heart size={16} />
                  </div>
                )}
                <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{prod.name}</h5>
                <span className="text-xs text-primary font-bold mt-1">₹{parseFloat(prod.basePrice).toFixed(0)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
