import React from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
}

export const Section: React.FC<SectionProps> = ({
  children,
  spacing = 'md',
  className = '',
  ...props
}) => {
  const spacings = {
    none: 'py-0',
    sm: 'py-6 sm:py-8',
    md: 'py-10 sm:py-12',
    lg: 'py-16 sm:py-20',
    xl: 'py-24 sm:py-32',
  };

  return (
    <section className={`${spacings[spacing]} ${className}`} {...props}>
      {children}
    </section>
  );
};

export default Section;
