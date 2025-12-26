import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: 'default' | 'dark' | 'gradient';
}

export default function Section({
  children,
  className,
  id,
  background = 'default',
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-20 lg:py-24',
        background === 'default' && 'bg-gray-950',
        background === 'dark' && 'bg-gray-900',
        background === 'gradient' && 'bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950',
        className
      )}
    >
      {children}
    </section>
  );
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({
  children,
  className,
  size = 'xl',
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        size === 'sm' && 'max-w-3xl',
        size === 'md' && 'max-w-4xl',
        size === 'lg' && 'max-w-5xl',
        size === 'xl' && 'max-w-7xl',
        size === 'full' && 'max-w-full',
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  centered = true,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(centered && 'text-center', className)}>
      <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-lg text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}
