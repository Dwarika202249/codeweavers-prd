import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const widthClass = typeof width === 'number' ? `w-[${width}px]` : width ? `w-[${width}]` : '';
  const heightClass = typeof height === 'number' 
    ? `h-[${height}px]` 
    : height 
      ? `h-[${height}]` 
      : variant === 'text' 
        ? 'h-[1em]' 
        : '';

  return (
    <div
      className={cn(
        'bg-gray-800',
        animation === 'pulse' && 'animate-pulse',
        animation === 'wave' && 'animate-shimmer',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        variant === 'text' && 'rounded',
        widthClass,
        heightClass,
        className
      )}
    />
  );
}

// Pre-built skeleton components for common use cases

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-gray-800 bg-gray-900 p-6', className)}>
      <div className="flex items-start justify-between">
        <Skeleton width={80} height={24} />
        <Skeleton width={60} height={20} />
      </div>
      <Skeleton className="mt-4" height={28} />
      <Skeleton className="mt-2" height={40} />
      <div className="mt-4 flex gap-2">
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
      </div>
      <Skeleton className="mt-6" height={40} />
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

export function SkeletonTestimonial({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-gray-800 bg-gray-900 p-6', className)}>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} width={16} height={16} />
        ))}
      </div>
      <SkeletonText lines={3} className="mt-4" />
      <div className="mt-6 flex items-center gap-4 border-t border-gray-800 pt-4">
        <SkeletonAvatar size={40} />
        <div className="flex-1">
          <Skeleton height={16} width={120} />
          <Skeleton height={14} width={80} className="mt-1" />
        </div>
      </div>
    </div>
  );
}
