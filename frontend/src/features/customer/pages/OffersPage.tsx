import React from 'react';
import SEO from '../../../shared/components/SEO';
import Card, { CardContent } from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/components/ui/Toast';
import { Tag, Calendar, Copy, Percent, Sparkles } from 'lucide-react';
import { useActiveCoupons } from '../../cart/store/cartQueries';

export const OffersPage: React.FC = () => {
  const toast = useToast();
  const { data: coupons = [], isLoading, isError } = useActiveCoupons();

  const handleCopyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
  };

  return (
    <>
      <SEO
        title="Promotions, Coupons & Offers"
        description="Browse active Oven Xpress discount codes, welcome coupons, free delivery weekend promotions, and special culinary deals."
        keywords="Oven Xpress coupons, promo codes, food discount list, free delivery codes"
      />

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12 font-sans">
        <div className="relative rounded-2xl bg-gradient-to-r from-primary to-primary-hover p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl select-none">
          <div className="space-y-4 max-w-xl text-center md:text-left z-10">
            <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <Sparkles size={10} />
              <span>Live Promotions</span>
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
              Sizzle Up Your Savings
            </h1>
            <p className="text-sm text-white/80 leading-relaxed font-sans">
              Enter promo codes at checkout to unlock savings on custom firebrick pizzas, craft
              cheeseburgers, and sweet desserts.
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20 shadow-inner z-10">
            <Percent size={28} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-b border-border/40 pb-4">
            <h2 className="text-xl font-display font-bold text-white tracking-wide">
              Active Coupon Codes
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            </div>
          ) : isError ? (
            <p className="text-muted-foreground text-sm">Unable to load coupons from server.</p>
          ) : coupons.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active coupons at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((offer) => (
                <Card
                  key={offer.id}
                  className="border border-border/60 bg-card/40 hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                          <Tag size={12} />
                          {offer.discountType.replace('_', ' ')}
                        </span>
                        <h3 className="text-lg font-display font-bold text-white">{offer.code}</h3>
                        {offer.description && (
                          <p className="text-xs text-muted-foreground">{offer.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard(offer.code)}
                        className="p-2 rounded-lg border border-border/60 hover:bg-secondary/50 text-muted-foreground hover:text-white transition-colors"
                        aria-label={`Copy code ${offer.code}`}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Calendar size={12} />
                      <span>Valid until {new Date(offer.endDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-semibold text-accent">
                      {offer.discountType === 'PERCENTAGE'
                        ? `${offer.discountValue}% off`
                        : offer.discountType === 'FIXED_AMOUNT'
                          ? `$${parseFloat(offer.discountValue).toFixed(2)} off`
                          : 'Free delivery'}
                      {parseFloat(offer.minimumAmount) > 0 &&
                        ` · Min order $${parseFloat(offer.minimumAmount).toFixed(2)}`}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OffersPage;
