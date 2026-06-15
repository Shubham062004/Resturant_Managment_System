import { motion } from 'framer-motion';
import React from 'react';

import { hoverScalePreset } from '../../theme/animations';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outline';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', className = '', ...props }, ref) => {
    const baseStyles =
      'rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm overflow-hidden';

    const variants = {
      default: '',
      elevated: 'shadow-lg border-border/50',
      interactive:
        'hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer',
      outline: 'border-2 border-border/80 shadow-none bg-transparent',
    };

    if (variant === 'interactive') {
      return (
        <motion.div
          ref={ref as React.Ref<HTMLDivElement>}
          className={`${baseStyles} ${variants[variant]} ${className}`}
          {...hoverScalePreset}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-6 flex flex-col gap-1.5 border-b border-border/40 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`p-6 font-sans text-sm text-foreground/80 leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`p-6 border-t border-border/40 flex items-center justify-end gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);
export default Card;
