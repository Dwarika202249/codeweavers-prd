import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

export default function StatCard({ value, label, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn('text-center', className)}>
      {Icon && (
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-900/50">
          <Icon className="h-6 w-6 text-indigo-400" />
        </div>
      )}
      <p className="text-3xl font-bold text-indigo-400 sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
    </div>
  );
}
