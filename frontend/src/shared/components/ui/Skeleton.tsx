import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  className = '',
  ...props
}) => {
  const baseClass = 'animate-pulse bg-muted/65 rounded';

  const variants = {
    text: 'h-4 w-full rounded',
    rect: 'w-full h-full rounded-lg',
    circle: 'rounded-full aspect-square',
  };

  return (
    <div
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

// Specialized skeleton presets

export const ProductSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col gap-4"
      >
        <Skeleton variant="rect" className="w-full aspect-[4/3] rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-2/3 h-5" />
          <Skeleton variant="text" className="w-full h-4" />
        </div>
        <div className="flex justify-between items-center mt-2">
          <Skeleton variant="text" className="w-1/3 h-6" />
          <Skeleton variant="rect" className="w-20 h-9 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 w-full">
    {/* Grid of stats cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border/80 p-5 rounded-2xl flex flex-col gap-3"
        >
          <Skeleton variant="text" className="w-1/3 h-4" />
          <Skeleton variant="text" className="w-1/2 h-8" />
        </div>
      ))}
    </div>

    {/* Split sections */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-card border border-border/80 p-5 rounded-2xl flex flex-col gap-4">
        <Skeleton variant="text" className="w-1/4 h-5" />
        <Skeleton variant="rect" className="w-full h-[250px] rounded-xl" />
      </div>
      <div className="bg-card border border-border/80 p-5 rounded-2xl flex flex-col gap-4">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Skeleton variant="circle" className="w-10 h-10" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skeleton variant="text" className="w-1/2 h-4" />
                <Skeleton variant="text" className="w-1/3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="w-full bg-card border border-border/80 rounded-2xl overflow-hidden">
    <div className="px-6 py-4.5 border-b border-border/40 flex items-center justify-between">
      <Skeleton variant="text" className="w-1/5 h-5" />
      <Skeleton variant="rect" className="w-24 h-9 rounded-lg" />
    </div>
    <div className="p-6 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border/40">
            {Array.from({ length: 4 }).map((_, i) => (
              <th key={i} className="pb-3.5 px-4">
                <Skeleton variant="text" className="w-16 h-4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, r) => (
            <tr key={r} className="border-b border-border/20 last:border-0">
              {Array.from({ length: 4 }).map((_, c) => (
                <td key={c} className="py-4.5 px-4">
                  <Skeleton variant="text" className="w-24 h-4" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-card border border-border/80 rounded-2xl p-5 flex flex-col gap-4">
    <div className="flex gap-4 items-center">
      <Skeleton variant="circle" className="w-12 h-12" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton variant="text" className="w-1/2 h-4" />
        <Skeleton variant="text" className="w-1/3 h-3" />
      </div>
    </div>
    <Skeleton variant="rect" className="w-full h-32 rounded-xl" />
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="bg-card border border-border/80 rounded-2xl p-6 flex flex-col items-center text-center gap-5 w-full max-w-sm mx-auto">
    <Skeleton variant="circle" className="w-24 h-24" />
    <div className="flex flex-col gap-2.5 items-center w-full">
      <Skeleton variant="text" className="w-1/2 h-5" />
      <Skeleton variant="text" className="w-2/3 h-4" />
    </div>
    <div className="w-full border-t border-border/40 pt-4 flex justify-around">
      <Skeleton variant="text" className="w-1/4 h-8 rounded-lg" />
      <Skeleton variant="text" className="w-1/4 h-8 rounded-lg" />
    </div>
  </div>
);

export default Skeleton;
