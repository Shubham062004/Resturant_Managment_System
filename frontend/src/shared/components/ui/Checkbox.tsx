import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, checked, onChange, error, disabled, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className={`inline-flex items-center gap-3 cursor-pointer select-none text-sm font-sans font-medium text-foreground/90
            ${disabled ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <div className="relative">
            <input
              id={checkboxId}
              type="checkbox"
              ref={ref}
              checked={checked}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked)}
              className="sr-only peer"
              {...props}
            />

            {/* Custom styled box */}
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2
                ${checked ? 'bg-primary border-primary text-white scale-100 shadow-sm' : 'border-border bg-secondary hover:border-muted-foreground'}
                ${error ? 'border-danger' : ''}
              `}
            >
              {checked && <Check size={14} strokeWidth={3} />}
            </div>
          </div>

          {label && <span>{label}</span>}
        </label>

        {error && <p className="text-xs font-medium font-sans leading-none text-danger mt-1 pl-8">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
