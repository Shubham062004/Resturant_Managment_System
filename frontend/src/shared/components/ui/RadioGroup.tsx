import React from 'react';

interface RadioGroupContextValue {
  name: string;
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  direction = 'vertical',
  disabled = false,
  className = '',
  children,
}) => {
  return (
    <RadioGroupContext.Provider value={{ name, selectedValue: value, onChange, disabled }}>
      <div
        role="radiogroup"
        className={`flex ${direction === 'horizontal' ? 'flex-row gap-6' : 'flex-col gap-3'} ${className}`}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  label?: string;
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  label,
  disabled: itemDisabled,
  className = '',
  id,
  ...props
}) => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup component');
  }

  const { name, selectedValue, onChange, disabled: groupDisabled } = context;
  const isDisabled = itemDisabled || groupDisabled;
  const isChecked = selectedValue === value;
  const radioId = id || `radio-${name}-${value}`;

  return (
    <label
      htmlFor={radioId}
      className={`inline-flex items-center gap-3 cursor-pointer select-none text-sm font-sans font-medium text-foreground/90
        ${isDisabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      <div className="relative">
        <input
          id={radioId}
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={() => onChange(value)}
          className="sr-only peer"
          {...props}
        />

        {/* Custom radio circular container */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2
            ${isChecked ? 'border-primary' : 'border-border bg-secondary hover:border-muted-foreground'}
          `}
        >
          {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </div>
      </div>

      {label && <span>{label}</span>}
    </label>
  );
};
export default RadioGroup;
