import React from 'react';
import { MapPin, Clock, Star, Navigation, Phone } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import type { Branch } from '../../../shared/data/branches';

interface BranchCardProps {
  branch: Branch;
  isSelected?: boolean;
  isFocused?: boolean;
  onSelect: (branch: Branch) => void;
  onFocus?: (branch: Branch) => void;
}

const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  isSelected,
  isFocused,
  onSelect,
  onFocus,
}) => {
  const isOpen = branch.active !== false;

  return (
    <div
      onClick={() => onFocus?.(branch)}
      className={`relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
        isFocused
          ? 'border-primary/40 bg-white/[0.04] shadow-lg shadow-primary/5'
          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Name + status */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white text-base">{branch.name}</h3>
            {isSelected && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/30">
                ✓ Selected
              </span>
            )}
            <span
              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}
              />
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          {/* Address */}
          <p className="text-sm text-neutral-400 leading-relaxed flex items-start gap-1.5">
            <MapPin size={14} className="text-neutral-500 mt-0.5 flex-shrink-0" />
            {branch.address}
          </p>

          {/* Meta: hours, distance, phone */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-primary" />
              {branch.openingHours}
            </span>
            {branch.distance !== undefined && (
              <span className="flex items-center gap-1 text-primary font-medium">
                <Navigation size={10} />
                {branch.distance} mi · ~{Math.max(15, Math.round(branch.distance * 8))} min
              </span>
            )}
            {branch.phone && (
              <span className="flex items-center gap-1">
                <Phone size={12} />
                {branch.phone}
              </span>
            )}
          </div>
        </div>

        {/* Select button */}
        <div className="flex flex-col items-end gap-2">
          <Button
            variant={isSelected ? 'success' : 'outline'}
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(branch);
            }}
            className="font-bold text-[10px] uppercase tracking-wider whitespace-nowrap"
          >
            {isSelected ? '✓ Active' : 'Select'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BranchCard;
