import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      type = 'text',
      label,
      error,
      success,
      helperText,
      prefixIcon,
      suffixIcon,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${inputId}-helper`;
    const isPassword = type === 'password';

    const handlePasswordToggle = () => {
      setShowPassword((prev) => !prev);
    };

    const isError = !!error;
    const isSuccess = !!success;

    let borderClass = 'border-border focus:border-primary';
    if (isError) {
      borderClass = 'border-danger focus:border-danger';
    } else if (isSuccess) {
      borderClass = 'border-success focus:border-success';
    }

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div
        className={`w-full flex flex-col gap-1.5 ${disabled ? 'opacity-50' : ''}`}
      >
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs uppercase tracking-wider font-semibold font-display text-foreground/80"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground/80">
              {prefixIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={inputType}
            disabled={disabled}
            aria-invalid={isError ? 'true' : 'false'}
            aria-describedby={
              helperText || error || success ? helperId : undefined
            }
            className={`w-full bg-secondary border px-4 py-3 rounded-lg text-foreground focus:outline-none transition-all duration-200 font-sans text-sm
              ${prefixIcon ? 'pl-10' : ''}
              ${suffixIcon || isPassword ? 'pr-10' : ''}
              ${borderClass}
              ${className}
            `}
            {...props}
          />

          {isPassword && !disabled && (
            <button
              type="button"
              onClick={handlePasswordToggle}
              className="absolute right-3.5 flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {!isPassword && suffixIcon && (
            <div className="absolute right-3.5 flex items-center text-muted-foreground/80">
              {suffixIcon}
            </div>
          )}
        </div>

        {(error || success || helperText) && (
          <p
            id={helperId}
            className={`text-xs font-medium font-sans leading-none mt-0.5
              ${isError ? 'text-danger' : ''}
              ${isSuccess ? 'text-success' : ''}
              ${!isError && !isSuccess ? 'text-muted-foreground' : ''}
            `}
          >
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
