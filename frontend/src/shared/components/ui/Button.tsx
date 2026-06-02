import React from 'react';
import { motion } from 'framer-motion';
import { hoverScalePreset } from '../../theme/animations';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      children,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-display font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-primary/20',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
      outline: 'bg-transparent text-foreground border-2 border-border hover:bg-secondary/40',
      ghost: 'bg-transparent text-foreground hover:bg-secondary/45',
      success: 'bg-success text-white hover:bg-success/90 shadow-md hover:shadow-success/20',
      danger: 'bg-danger text-white hover:bg-danger/90 shadow-md hover:shadow-danger/20',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1.5 gap-1',
      sm: 'text-sm px-3.5 py-2 gap-1.5',
      md: 'text-base px-5 py-2.5 gap-2',
      lg: 'text-lg px-6 py-3 gap-2.5',
      xl: 'text-xl px-8 py-4 gap-3',
    };

    // Spin component
    const Spinner = () => (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...(disabled || isLoading ? {} : hoverScalePreset)}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <Spinner />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
