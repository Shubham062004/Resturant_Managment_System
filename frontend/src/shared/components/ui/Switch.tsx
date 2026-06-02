import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  id,
}) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label
      htmlFor={switchId}
      className={`inline-flex items-center gap-3 cursor-pointer select-none text-sm font-sans font-medium text-foreground/90
        ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      <div className="relative">
        <input
          id={switchId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />

        {/* Sliding background pill */}
        <div
          className={`w-11 h-6 bg-secondary border border-border rounded-full transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2
            ${checked ? 'bg-primary border-primary' : ''}
          `}
        />

        {/* Thumb circular slider */}
        <div
          className={`absolute left-0.5 top-0.5 bg-white border border-border w-5 h-5 rounded-full shadow-sm transition-transform duration-200
            ${checked ? 'translate-x-5' : ''}
          `}
        />
      </div>

      {label && <span>{label}</span>}
    </label>
  );
};

export default Switch;
