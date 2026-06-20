import { Tag, Copy, Sparkles } from 'lucide-react';
import React from 'react';

import { useToast } from '../../../shared/components/ui/Toast';

interface Offer {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  minimumAmount: string;
}

interface OfferBannerProps {
  offers: Offer[];
}

export const OfferBanner: React.FC<OfferBannerProps> = ({ offers }) => {
  const toast = useToast();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
  };

  if (!offers || offers.length === 0) return null;

  // Gradients for coupons to make it look premium
  const gradients = [
    'from-primary/20 via-pink-500/5 to-transparent border-primary/20',
    'from-amber-500/20 via-orange-500/5 to-transparent border-amber-500/20',
    'from-emerald-500/20 via-teal-500/5 to-transparent border-emerald-500/20',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-amber-400" />
        <h2 className="text-xs uppercase font-extrabold tracking-widest text-neutral-400">
          Deals For You
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {offers.map((offer, idx) => {
          const gradient = gradients[idx % gradients.length];
          return (
            <div
              key={offer.id}
              className={`w-72 shrink-0 rounded-2xl border bg-gradient-to-tr ${gradient} p-5 flex flex-col justify-between space-y-4 relative overflow-hidden group`}
            >
              {/* Decorative light effect */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold tracking-wide">
                    <Tag size={12} />
                    <span>
                      {offer.discountType === 'PERCENTAGE'
                        ? `${offer.discountValue}% OFF`
                        : offer.discountType === 'FIXED_AMOUNT'
                          ? `₹${parseFloat(offer.discountValue).toFixed(0)} OFF`
                          : 'FREE DELIVERY'}
                    </span>
                  </div>
                  <h3 className="text-white font-extrabold text-lg tracking-tight uppercase">
                    {offer.code}
                  </h3>
                  <p className="text-neutral-400 text-[11px] leading-relaxed line-clamp-2">
                    {offer.description}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(offer.code)}
                  className="bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white p-2 rounded-xl border border-white/5 transition-all active:scale-90"
                  title="Copy Code"
                >
                  <Copy size={14} />
                </button>
              </div>

              <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                Min. Order Value: ₹{parseFloat(offer.minimumAmount).toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OfferBanner;
