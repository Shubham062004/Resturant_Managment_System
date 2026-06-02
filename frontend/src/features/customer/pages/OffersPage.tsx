import React from 'react';
import SEO from '../../../shared/components/SEO';
import Card, { CardContent } from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/components/ui/Toast';
import { Tag, Calendar, Copy, Percent, Sparkles } from 'lucide-react';
import mockOffers from '../../../shared/data/offers';

export const OffersPage: React.FC = () => {
  const toast = useToast();

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
        {/* Banner Promo Showcase */}
        <div className="relative rounded-2xl bg-gradient-to-r from-primary to-primary-hover p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl select-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="space-y-4 max-w-xl text-center md:text-left z-10">
            <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <Sparkles size={10} />
              <span>Catering Specials Available</span>
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

        {/* Promo Grid */}
        <div className="space-y-6">
          <div className="border-b border-border/40 pb-4">
            <h2 className="text-xl font-display font-bold text-white tracking-wide">
              Active Coupon Codes
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Copy coupon codes to apply them during your checkout flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockOffers.map((offer) => (
              <Card
                key={offer.id}
                className="bg-card/45 border border-border/60 flex flex-col justify-between h-full hover:border-primary/30 transition-all"
              >
                <div className="relative h-40 w-full overflow-hidden select-none">
                  <img
                    src={offer.bannerImage}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                    <Tag size={10} />
                    <span>{offer.discountPercentage}% OFF</span>
                  </div>
                </div>

                <CardContent className="p-5 flex-grow flex flex-col justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-sm md:text-base text-white tracking-tight leading-tight">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                      {offer.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-sans text-muted-foreground border-t border-border/40 pt-4">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Expires {offer.expiryDate}
                      </span>
                      <span>Min Order: ${offer.minOrderValue.toFixed(2)}</span>
                    </div>

                    {/* Copy code input box */}
                    <div className="bg-secondary/70 border border-border/50 rounded-lg p-2 flex items-center justify-between gap-3 font-mono text-xs">
                      <span className="text-white font-bold select-all tracking-wider px-1">
                        {offer.code}
                      </span>
                      <button
                        onClick={() => handleCopyToClipboard(offer.code)}
                        className="p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all"
                        title="Copy promo code"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default OffersPage;
