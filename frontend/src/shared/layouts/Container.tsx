import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  clean?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  clean = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8
        ${clean ? '' : 'max-w-7xl'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
