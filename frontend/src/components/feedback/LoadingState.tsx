import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'card' | 'page' | 'spinner' | 'tracker-card' | 'timeline' | 'document-viewer' | 'dashboard-stats';
  count?: number;
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  count = 1,
  message = 'Loading content...',
  className,
}) => {
  if (variant === 'tracker-card') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full', className)}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="border border-slate-200/80 bg-white rounded-medium overflow-hidden shadow-subtle flex flex-col h-[400px] animate-pulse select-none"
          >
            {/* Top Photo aspect ratio placeholder */}
            <div className="h-[200px] w-full bg-slate-100 border-b border-slate-100" />
            <div className="p-5 flex flex-col flex-1 justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded-full w-16" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-3 bg-slate-150 rounded w-full" />
                  <div className="h-3 bg-slate-150 rounded w-5/6" />
                </div>
                <div className="flex gap-4 pt-2">
                  <div className="h-3 bg-slate-200 rounded w-24" />
                  <div className="h-3 bg-slate-200 rounded w-16" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  ))}
                </div>
                <div className="h-3 bg-slate-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className={cn('w-full space-y-6 animate-pulse select-none p-2', className)}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex gap-4 relative">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-100 flex items-center justify-center font-bold text-xs" />
              {idx < count - 1 && <div className="w-[2px] h-12 bg-slate-150" />}
            </div>
            <div className="space-y-2 pt-1 flex-1">
              <div className="h-3.5 bg-slate-200 rounded w-1/4" />
              <div className="h-3 bg-slate-150 rounded w-16" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'document-viewer') {
    return (
      <div className={cn('border border-slate-200 bg-white rounded-medium flex flex-col overflow-hidden w-full shadow-subtle animate-pulse select-none', className)}>
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2">
          <div className="h-8 bg-slate-200 rounded w-28" />
          <div className="h-8 bg-slate-200 rounded w-28" />
          <div className="h-8 bg-slate-200 rounded w-28" />
        </div>
        <div className="p-6 space-y-6 flex-1">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="flex gap-2">
              <div className="h-8 bg-slate-200 rounded w-16" />
              <div className="h-8 bg-slate-200 rounded w-20" />
            </div>
          </div>
          <div className="border border-slate-200 rounded p-6 space-y-4 bg-slate-50/50 min-h-[300px]">
            <div className="h-4 bg-slate-200 rounded w-1/3 pb-2 border-b border-slate-200" />
            <div className="space-y-2.5 pt-4">
              <div className="h-3 bg-slate-250 rounded w-full" />
              <div className="h-3 bg-slate-250 rounded w-full" />
              <div className="h-3 bg-slate-250 rounded w-5/6" />
              <div className="h-3 bg-slate-250 rounded w-4/5" />
              <div className="h-3 bg-slate-250 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'dashboard-stats') {
    return (
      <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4 w-full animate-pulse select-none', className)}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="border border-slate-200 bg-white rounded-medium p-4 space-y-2 shadow-subtle">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="w-4 h-4 rounded bg-slate-150" />
            </div>
            <div className="h-6 bg-slate-300 rounded w-12" />
            <div className="h-3 bg-slate-150 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6 w-full', className)}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="border border-secondary-border bg-white rounded-medium p-6 space-y-4 animate-pulse select-none"
          >
            {/* Header placeholder */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-6 bg-slate-200 rounded-small w-16" />
            </div>

            {/* Description placeholder */}
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
            </div>

            {/* Footer metadata placeholder */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-50 gap-4">
              <div className="h-3 bg-slate-200 rounded w-20" />
              <div className="h-3 bg-slate-200 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className={cn('w-full space-y-8 py-8 animate-pulse select-none', className)}>
        {/* Page Header Skeleton */}
        <div className="space-y-3 pb-6 border-b border-secondary-border">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-2/5" />
        </div>

        {/* Content Section Skeletons */}
        <div className="space-y-6">
          <div className="h-32 bg-white border border-secondary-border rounded-medium p-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-white border border-secondary-border rounded-medium p-6" />
            <div className="h-40 bg-white border border-secondary-border rounded-medium p-6" />
            <div className="h-40 bg-white border border-secondary-border rounded-medium p-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center space-y-3 w-full min-h-[200px]',
        className
      )}
    >
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      {message && <p className="text-sm font-medium text-slate-500 font-sans">{message}</p>}
    </div>
  );
};

export default LoadingState;
