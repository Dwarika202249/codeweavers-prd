import type { Experience } from '../../types';
import { cn } from '../../lib/utils';
import Badge from './Badge';

interface TimelineItemProps {
  experience: Experience;
  isLast?: boolean;
  className?: string;
}

export default function TimelineItem({ experience, isLast = false, className }: TimelineItemProps) {
  const typeVariant = {
    industry: 'info',
    teaching: 'success',
    mentoring: 'warning',
    internship: 'teal',
  } as const;

  return (
    <div
      className={cn(
        'relative pl-8',
        // Timeline dot
        'before:absolute before:left-0 before:top-2 before:h-3 before:w-3 before:rounded-full before:bg-indigo-500',
        // Timeline line
        !isLast && 'after:absolute after:left-1.5 after:top-6 after:h-[calc(100%-1rem)] after:w-0.5 after:bg-gray-700',
        className
      )}
    >
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={typeVariant[experience.type]}>
            {experience.type.charAt(0).toUpperCase() + experience.type.slice(1)}
          </Badge>
          <span className="text-sm text-gray-500">{experience.period}</span>
        </div>

        <h3 className="mt-3 text-xl font-semibold text-white">{experience.title}</h3>
        <p className="text-indigo-400">{experience.organization}</p>
        <p className="mt-3 text-gray-300">{experience.description}</p>

        <ul className="mt-4 space-y-2">
          {experience.highlights.map((highlight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
