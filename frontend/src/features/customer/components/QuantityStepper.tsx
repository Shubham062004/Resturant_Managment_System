import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import React from 'react';

interface QuantityStepperProps {
  quantity: number;
  onIncrease: (e: React.MouseEvent) => void;
  onDecrease: (e: React.MouseEvent) => void;
  isLoading?: boolean;
  size?: 'sm' | 'lg';
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  isLoading = false,
  size = 'sm',
}) => {
  const containerVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.15 } },
  };

  const isSmall = size === 'sm';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="stepper"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`flex items-center justify-between bg-primary rounded-xl overflow-hidden shadow-lg shadow-primary/20 border border-primary/30 select-none ${
          isSmall ? 'h-9 min-w-[100px]' : 'h-14 min-w-[160px]'
        }`}
      >
        {/* Decrease Button */}
        <button
          onClick={onDecrease}
          disabled={isLoading}
          className={`flex items-center justify-center hover:bg-primary-hover active:bg-primary-dark text-white transition-all disabled:opacity-50 ${
            isSmall ? 'w-8 h-full text-xs' : 'w-12 h-full text-sm'
          } min-h-[44px] min-w-[44px] focus:outline-none`}
          aria-label="Decrease quantity"
        >
          <Minus size={isSmall ? 14 : 18} className="stroke-[2.5]" />
        </button>

        {/* Quantity Display */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={quantity}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`text-white font-extrabold text-center flex-1 ${
              isSmall ? 'text-xs min-w-[20px]' : 'text-base min-w-[32px]'
            }`}
          >
            {quantity}
          </motion.span>
        </AnimatePresence>

        {/* Increase Button */}
        <button
          onClick={onIncrease}
          disabled={isLoading}
          className={`flex items-center justify-center hover:bg-primary-hover active:bg-primary-dark text-white transition-all disabled:opacity-50 ${
            isSmall ? 'w-8 h-full text-xs' : 'w-12 h-full text-sm'
          } min-h-[44px] min-w-[44px] focus:outline-none`}
          aria-label="Increase quantity"
        >
          <Plus size={isSmall ? 14 : 18} className="stroke-[2.5]" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuantityStepper;
