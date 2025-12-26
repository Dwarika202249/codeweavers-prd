import { cn } from '../../lib/utils';

interface SkillTagProps {
  skill: string;
  className?: string;
}

export default function SkillTag({ skill, className }: SkillTagProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-center text-gray-200',
        'transition-colors hover:border-indigo-500/50 hover:text-white',
        className
      )}
    >
      {skill}
    </div>
  );
}
