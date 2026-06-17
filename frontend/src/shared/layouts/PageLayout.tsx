import React from 'react';

import Container from './Container';

export interface PageLayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  headerActions,
  children,
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col gap-6 py-6 sm:py-8 ${className}`}>
      <Container>
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm font-sans text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-3">{headerActions}</div>
          )}
        </header>
      </Container>
      <main className="w-full flex-1">
        <Container>{children}</Container>
      </main>
    </div>
  );
};

export default PageLayout;
