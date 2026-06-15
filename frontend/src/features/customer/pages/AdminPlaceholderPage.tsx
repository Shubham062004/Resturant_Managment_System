import { ShieldCheck, Database, KeyRound, AlertTriangle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';

export const AdminPlaceholderPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const clearanceLevel = user?.role || 'NONE';
  const hasAccess = ['ADMIN', 'SUPER_ADMIN'].includes(clearanceLevel);

  return (
    <div className="min-h-screen bg-[#08070F] text-white pt-28 pb-16 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white flex items-center justify-center md:justify-start gap-3">
            <ShieldCheck className="h-9 w-9 text-primary animate-pulse" /> Security clearance
            Management
          </h1>
          <p className="mt-2 text-neutral-400 text-sm font-light">
            Vault security configurations and catalogs control dashboards.
          </p>
        </div>

        {hasAccess ? (
          <div className="space-y-8">
            {/* Clearance Alert Card */}
            <div className="glass-card p-6 rounded-2xl border border-green-500/20 bg-green-500/[0.02] shadow-2xl flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-lg font-bold text-white font-display">
                  Clearance Granted: {clearanceLevel}
                </p>
                <p className="text-neutral-400 text-sm mt-1 font-light leading-relaxed">
                  Your credentials have been successfully authenticated with role-based access
                  control. You are authorized to manage restaurants, branches, categories, and
                  products metadata.
                </p>
              </div>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">
                    Active Outposts
                  </span>
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-extrabold text-white">5</p>
                <p className="text-xs text-green-400 mt-2 font-medium">PostgreSQL Connected</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">
                    Wok/Pizza Products
                  </span>
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-extrabold text-white">150</p>
                <p className="text-xs text-neutral-400 mt-2">15 Categories Seeding</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">
                    MongoDB Auditing
                  </span>
                  <KeyRound className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-3xl font-extrabold text-white">Active</p>
                <p className="text-xs text-amber-400 mt-2 font-medium">Tracking Views & Queries</p>
              </div>
            </div>

            {/* Dummy control panel */}
            <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-white/[0.01] min-h-[250px] flex flex-col justify-center items-center text-center">
              <Database className="h-12 w-12 text-neutral-600 mb-3" />
              <p className="text-lg font-bold text-neutral-400">Mock Metadata Console</p>
              <p className="text-neutral-500 text-sm mt-1 max-w-md font-light leading-relaxed">
                Future administrative tools (adding restaurants, editing variants stock, or
                analyzing query patterns) will plug directly here.
              </p>
            </div>
          </div>
        ) : (
          /* Access Denied */
          <div className="glass-card p-12 rounded-2xl border border-red-500/20 bg-red-500/[0.02] text-center max-w-2xl mx-auto shadow-2xl space-y-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-white">
                Security Clearance Level Denied
              </h2>
              <p className="text-neutral-400 text-sm font-light max-w-lg mx-auto leading-relaxed">
                This administrative console requires either <strong>ADMIN</strong> or{' '}
                <strong>SUPER_ADMIN</strong> permissions. Your current account clearance tier:{' '}
                <span className="text-red-400 font-semibold">{clearanceLevel}</span>.
              </p>
            </div>
            <div className="pt-4 flex gap-4 justify-center">
              <Link
                to="/"
                className="py-2.5 px-6 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-neutral-300 hover:text-white text-sm font-semibold rounded-xl transition-all"
              >
                Go Home
              </Link>
              <Link
                to="/login"
                className="py-2.5 px-6 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all"
              >
                Log In as Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPlaceholderPage;
