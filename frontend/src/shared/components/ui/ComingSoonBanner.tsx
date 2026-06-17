import { FlaskConical, Construction, Sparkles } from 'lucide-react';
import React from 'react';

interface ComingSoonBannerProps {
  /** Override the feature label shown in the badge */
  featureName?: string;
  /** Extra CSS classes for the wrapper */
  className?: string;
}

/**
 * ComingSoonBanner
 *
 * A non-intrusive, premium-styled banner that informs users the current
 * page/feature is showing sample/dummy data and full functionality is
 * under development.
 *
 * Usage:
 *   <ComingSoonBanner featureName="Supplier Management" />
 */
const ComingSoonBanner: React.FC<ComingSoonBannerProps> = ({
  featureName = 'This Feature',
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/50 via-yellow-950/40 to-amber-950/50 px-5 py-4 ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
        boxShadow:
          '0 0 0 1px rgba(251,191,36,0.15), 0 4px 24px rgba(251,191,36,0.08)',
      }}
    >
      {/* Decorative glow blobs */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -left-6 -bottom-6 h-24 w-24 rounded-full opacity-10"
        style={{
          background:
            'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)',
        }}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Icon cluster */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/30">
            <Construction size={18} className="text-amber-400" />
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-400/20">
            <FlaskConical size={14} className="text-amber-400/80" />
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-amber-300 font-display tracking-wide">
              {featureName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              <Sparkles size={9} />
              Coming Soon
            </span>
          </div>
          <p className="text-xs text-amber-200/60 leading-relaxed">
            The data displayed on this page is{' '}
            <span className="text-amber-300/80 font-medium">
              sample / demo data
            </span>{' '}
            for preview purposes. Full functionality — including live backend
            integration, CRUD operations, and real-time updates — is{' '}
            <span className="text-amber-300/80 font-medium">
              actively under development
            </span>{' '}
            and will be released in an upcoming sprint.
          </p>
        </div>

        {/* Right badge */}
        <div className="shrink-0 hidden lg:flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-400/20 px-3 py-1.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          <span className="text-[11px] font-semibold text-amber-400/90 tracking-wide whitespace-nowrap">
            In Development
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonBanner;
