import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, success, helperText, disabled, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${textareaId}-helper`;

    const isError = !!error;
    const isSuccess = !!success;

    let borderClass = 'border-border focus:border-primary';
    if (isError) {
      borderClass = 'border-danger focus:border-danger';
    } else if (isSuccess) {
      borderClass = 'border-success focus:border-success';
    }

    return (
      <div className={`w-full flex flex-col gap-1.5 ${disabled ? 'opacity-50' : ''}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs uppercase tracking-wider font-semibold font-display text-foreground/80"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          aria-invalid={isError ? 'true' : 'false'}
          aria-describedby={helperText || error || success ? helperId : undefined}
          className={`w-full bg-secondary border px-4 py-3 rounded-lg text-foreground focus:outline-none transition-all duration-200 font-sans text-sm min-h-[100px] resize-y
            ${borderClass}
            ${className}
          `}
          {...props}
        />

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
  },
);

Textarea.displayName = 'Textarea';
export default Textarea;
