import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CalendarDays,
  Eye,
  EyeOff,
  Wallet,
  Gift,
  Award,
  CircleDollarSign,
} from 'lucide-react';
import React, { useState } from 'react';

import { useAppSelector } from '../../../app/store';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';

export default function StaffProfilePage() {
  const { user } = useAppSelector((state) => state.auth);

  // Earnings Visibility State
  const [showEarnings, setShowEarnings] = useState(false);

  // Mock Earnings Data (in a real app, this comes from backend user.salary or similar)
  const earnings = {
    monthlySalary: 18000,
    bonus: 1250,
    incentives: 450,
  };
  const totalEarnings =
    earnings.monthlySalary + earnings.bonus + earnings.incentives;

  const toggleEarnings = () => setShowEarnings(!showEarnings);

  const formatCurrency = (amount: number) => {
    return showEarnings ? `₹${amount.toLocaleString()}` : '********';
  };

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-white tracking-tight">
          My Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal information and view earnings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-slate-900/60 border-border/20 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-900 shadow-xl flex items-center justify-center overflow-hidden mb-4 relative group">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-slate-400">
                  {user?.firstName?.[0] || 'S'}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white font-display">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-slate-400 mb-3">{user?.email}</p>

            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold px-3 py-1 text-xs">
              {user?.role?.replace('_', ' ') || 'STAFF'}
            </Badge>

            <div className="w-full mt-6 pt-6 border-t border-border/10 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Briefcase size={14} /> Employee ID
                </span>
                <span className="font-mono text-slate-300 font-bold">
                  EMP-{user?.id?.slice(0, 6).toUpperCase() || '000000'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <MapPin size={14} /> Branch
                </span>
                <span className="text-slate-300 font-bold">ABC Downtown</span>
              </div>
            </div>
          </Card>

          {/* Contact Details */}
          <Card className="p-6 bg-slate-900/60 border-border/20">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-primary" /> Contact Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-border/5">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <Phone size={16} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                    Phone Number
                  </p>
                  <p className="text-sm text-slate-300 font-medium">
                    {user?.phone || '+91 98765 43210'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-border/5">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                    Email Address
                  </p>
                  <p className="text-sm text-slate-300 font-medium truncate w-48">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Employment & Earnings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employment Information */}
          <Card className="p-6 bg-slate-900/40 border-border/20">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <CalendarDays size={16} className="text-sky-500" /> Employment
              Record
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/50 rounded-xl border border-border/10">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                  Department
                </p>
                <p className="font-bold text-slate-200">Kitchen Operations</p>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-border/10">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                  Designation
                </p>
                <p className="font-bold text-slate-200">Senior Line Cook</p>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-border/10">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                  Joining Date
                </p>
                <p className="font-bold text-slate-200">
                  {/* @ts-ignore */}
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-border/10">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                  Manager
                </p>
                <p className="font-bold text-slate-200">
                  John Doe (Branch Mgr)
                </p>
              </div>
            </div>
          </Card>

          {/* Earnings Section with Visibility Toggle */}
          <Card className="p-6 bg-slate-900/40 border-border/20 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-sky-500/5 pointer-events-none" />

            <div className="flex justify-between items-center mb-6 relative">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Wallet size={16} className="text-emerald-500" /> Salary &
                Earnings
              </h3>
              <button
                onClick={toggleEarnings}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                {showEarnings ? <EyeOff size={14} /> : <Eye size={14} />}
                {showEarnings ? 'Hide' : 'Show'} Values
              </button>
            </div>

            <div className="space-y-4 relative">
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-border/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <CircleDollarSign size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Monthly Salary</p>
                    <p className="text-[10px] text-slate-500">Base fixed pay</p>
                  </div>
                </div>
                <span
                  className={`text-xl font-mono ${showEarnings ? 'text-white' : 'text-slate-500 tracking-widest'}`}
                >
                  {formatCurrency(earnings.monthlySalary)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-border/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <Gift size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Bonus</p>
                    <p className="text-[10px] text-slate-500">
                      From 5-Star Ratings
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xl font-mono ${showEarnings ? 'text-amber-400' : 'text-slate-500 tracking-widest'}`}
                >
                  {formatCurrency(earnings.bonus)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-border/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Incentives</p>
                    <p className="text-[10px] text-slate-500">
                      Performance milestones
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xl font-mono ${showEarnings ? 'text-sky-400' : 'text-slate-500 tracking-widest'}`}
                >
                  {formatCurrency(earnings.incentives)}
                </span>
              </div>

              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 mt-4">
                <span className="font-bold text-white uppercase tracking-widest text-sm">
                  Total Earnings
                </span>
                <span
                  className={`text-3xl font-bold font-mono ${showEarnings ? 'text-emerald-400' : 'text-emerald-500/50 tracking-widest'}`}
                >
                  {formatCurrency(totalEarnings)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
