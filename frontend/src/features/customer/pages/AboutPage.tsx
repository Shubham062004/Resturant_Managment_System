import { motion } from 'framer-motion';
import { Flame, Target, ShieldCheck, Clock } from 'lucide-react';
import React from 'react';

import SEO from '../../../shared/components/SEO';

export const AboutPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Our Story & Vision"
        description="Learn how ABC combines premium brick oven baking styles with modern digital smart kitchen automation."
        keywords="About ABC, brick oven pizza history, culinary automation, smart kitchen management"
      />

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-16">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center text-primary border border-primary/20 shadow-sm mb-2"
          >
            <Flame size={24} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-display font-extrabold tracking-tight text-white"
          >
            Searing Heat. Smart Service.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground font-sans max-w-xl mx-auto leading-relaxed text-sm md:text-base"
          >
            We are culinary builders and automation architects, serving fire-baked perfection with
            absolute delivery reliability.
          </motion.p>
        </div>

        {/* Narrative & History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center border-t border-border/40 pt-12">
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white tracking-wide">
              The Hearth & The Code
            </h2>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              ABC began with a single vision: how to serve authentic Neapolitan-style stone crust
              pizzas and handcrafted gourmet burger blends without the traditional restaurant
              delays.
            </p>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              By combining a customized 800°F stone hearth pizza deck with a modular kitchen
              dispatching system, we unified high-speed culinary prep with live client progress
              tickets.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video border border-border/60 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80"
              alt="Kitchen stone oven baking pizza"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Core Values / Grid */}
        <div className="space-y-8 border-t border-border/40 pt-12">
          <h2 className="text-center font-display font-bold text-xl text-white tracking-wide">
            Our Operations Pillars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card/45 border border-border/50 p-6 rounded-xl space-y-3">
              <Target className="text-primary" size={20} />
              <h3 className="font-display font-bold text-sm text-white">Absolute Quality</h3>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                Premium unbleached flours, fresh San Marzano tomatoes, and custom blend brisket
                patties. Never frozen.
              </p>
            </div>

            <div className="bg-card/45 border border-border/50 p-6 rounded-xl space-y-3">
              <Clock className="text-primary" size={20} />
              <h3 className="font-display font-bold text-sm text-white">Rapid Fulfilment</h3>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                Proprietary heat retention boxes and smart logistics ensure food arrives at peak
                tasting temperature.
              </p>
            </div>

            <div className="bg-card/45 border border-border/50 p-6 rounded-xl space-y-3">
              <ShieldCheck className="text-primary" size={20} />
              <h3 className="font-display font-bold text-sm text-white">Sanitation Shield</h3>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                Rigid temperature logs and contactless handoffs verify safety protocols at every
                single checkpoint.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
