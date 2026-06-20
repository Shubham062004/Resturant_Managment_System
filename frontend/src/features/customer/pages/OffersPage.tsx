import { Tag, Calendar, Copy, Percent, Sparkles, MapPin } from 'lucide-react';
import React from 'react';

import { useAppSelector } from '../../../app/store';
import SEO from '../../../shared/components/SEO';
import SkeletonCard from '../../../shared/components/ui/SkeletonCard';
import { useToast } from '../../../shared/components/ui/Toast';
import { useActiveCoupons } from '../../cart/store/cartQueries';
import { useCustomerOffers } from '../store/catalogQueries';

export const OffersPage: React.FC = () => {
  const toast = useToast();
  const { selectedBranch } = useAppSelector((state) => state.customer);
  const { data: branchOffersRes, isLoading: branchLoading, isError: branchError } = useCustomerOffers(selectedBranch?.id || '');
  const { data: globalCoupons = [], isLoading: globalLoading, isError: globalError } = useActiveCoupons();

  const coupons = selectedBranch ? (branchOffersRes?.data || []) : globalCoupons;
  const isLoading = selectedBranch ? branchLoading : globalLoading;
  const isError = selectedBranch ? branchError : globalError;

  const handleCopyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied!`);
  };

  return (
    <>
      <SEO
        title="Offers & Discounts — ABC Restaurant"
        description="Browse our latest coupon codes and discounts for your favorite meals."
        keywords="ABC coupons, promo codes, food discount, free delivery"
      />

      <div className="min-h-screen bg-[#08070F] pt-24 pb-20 font-sans">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          {/* Hero Banner */}
          <div className="relative rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-amber-500/10 border border-white/10 p-8 md:p-14 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_var(--tw-gradient-stops))] from-primary/20 to-transparent pointer-events-none" />

            <div className="space-y-5 max-w-xl text-center md:text-left z-10">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-lg">
                <Sparkles size={12} />
                <span>Live Deals</span>
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight">
                Deals & Offers
              </h1>
              <p className="text-base text-neutral-400 leading-relaxed font-sans">
                Apply these promo codes at checkout to unlock savings on our
                delicious pizzas, burgers, and more.
              </p>
            </div>

            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shrink-0 shadow-2xl shadow-primary/30 z-10 border-4 border-white/10">
              <Percent size={48} strokeWidth={2.5} />
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <Sparkles size={14} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-4 flex items-center justify-between">
              <span>Active Coupon Codes</span>
              {selectedBranch && (
                <span className="text-xs text-neutral-400 font-semibold flex items-center gap-1">
                  <MapPin size={12} className="text-primary" />
                  Showing deals for {selectedBranch.name}
                </span>
              )}
            </h2>


            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} variant="offer" />
                ))}
              </div>
            ) : isError ? (
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8 text-center max-w-md mx-auto">
                <p className="text-red-400 font-semibold">
                  Unable to load offers right now.
                </p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl max-w-2xl mx-auto">
                <Tag className="mx-auto text-neutral-600 mb-4" size={48} />
                <p className="text-lg font-semibold text-white mb-2">
                  No active offers at the moment
                </p>
                <p className="text-neutral-500 text-sm">
                  Check back later for new discounts and deals.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((offer) => (
                  <div
                    key={offer.id}
                    className="group relative rounded-2xl border border-dashed border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.08] transition-all duration-300 p-6 flex flex-col justify-between h-full"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                            <Tag size={12} />
                            {offer.discountType.replace('_', ' ')}
                          </span>
                          <h3 className="text-2xl font-bold font-display text-white tracking-tight">
                            {offer.code}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyToClipboard(offer.code)}
                          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/20 text-neutral-400 hover:text-primary transition-colors active:scale-95"
                          aria-label={`Copy code ${offer.code}`}
                        >
                          <Copy size={16} />
                        </button>
                      </div>

                      {offer.description && (
                        <p className="text-sm text-neutral-400 leading-relaxed">
                          {offer.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-dashed border-primary/20 space-y-3">
                      <p className="text-lg font-bold text-white">
                        {offer.discountType === 'PERCENTAGE'
                          ? `${offer.discountValue}% OFF`
                          : offer.discountType === 'FIXED_AMOUNT'
                            ? `₹${parseFloat(offer.discountValue).toFixed(0)} OFF`
                            : 'FREE DELIVERY'}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                        {parseFloat(offer.minimumAmount) > 0 ? (
                          <span>
                            Min order: ₹
                            {parseFloat(offer.minimumAmount).toFixed(0)}
                          </span>
                        ) : (
                          <span>No min order</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Valid till{' '}
                          {new Date(offer.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OffersPage;
