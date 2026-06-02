import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info as InfoIcon } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  className = '',
  ...props
}) => {
  const baseStyles = 'flex gap-3.5 p-4.5 rounded-xl border font-sans text-sm leading-relaxed';

  const variants = {
    success: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    error: 'bg-danger/10 border-danger/30 text-danger',
    info: 'bg-info/10 border-info/30 text-info',
  };

  const icons = {
    success: <CheckCircle2 size={20} className="flex-shrink-0" />,
    warning: <AlertTriangle size={20} className="flex-shrink-0" />,
    error: <AlertOctagon size={20} className="flex-shrink-0" />,
    info: <InfoIcon size={20} className="flex-shrink-0" />,
  };

  return (
    <div role="alert" className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      <div className="mt-0.5">{icons[variant]}</div>
      <div className="flex flex-col gap-1 w-full">
        {title && <h5 className="font-bold font-display leading-tight">{title}</h5>}
        <div className="text-foreground/80">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
