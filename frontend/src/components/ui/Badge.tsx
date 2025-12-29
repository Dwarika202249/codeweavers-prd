import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'teal';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        // Sizes
        size === 'sm' && 'px-2.5 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        // Variants
        variant === 'default' && 'bg-gray-700 text-gray-200',
        variant === 'success' && 'bg-green-900/50 text-green-400',
        variant === 'warning' && 'bg-yellow-900/50 text-yellow-400',
        variant === 'error' && 'bg-red-900/50 text-red-400',
        variant === 'info' && 'bg-indigo-900/50 text-indigo-400',
        variant === 'teal' && 'bg-teal-900/50 text-teal-400',
        className
      )}
    >
      {children}
    </span>
  );
}
