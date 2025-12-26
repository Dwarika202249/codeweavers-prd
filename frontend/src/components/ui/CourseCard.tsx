import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import { cn } from '../../lib/utils';
import Badge from './Badge';

interface CourseCardProps {
  course: Course;
  className?: string;
}

export default function CourseCard({ course, className }: CourseCardProps) {
  const difficultyVariant = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'error',
  } as const;

  return (
    <div
      className={cn(
        'group rounded-xl border border-gray-800 bg-gray-900 p-6',
        'transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <Badge variant={difficultyVariant[course.difficulty]}>
          {course.difficulty}
        </Badge>
        <span className="text-sm text-gray-500">{course.duration}</span>
      </div>

      {/* Content */}
      <h3 className="mt-4 text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors">
        {course.title}
      </h3>
      <p className="mt-2 text-sm text-gray-400 line-clamp-2">
        {course.description}
      </p>

      {/* Topics */}
      <div className="mt-4 flex flex-wrap gap-2">
        {course.topics.slice(0, 4).map((topic) => (
          <span
            key={topic}
            className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300"
          >
            {topic}
          </span>
        ))}
        {course.topics.length > 4 && (
          <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-500">
            +{course.topics.length - 4} more
          </span>
        )}
      </div>

      {/* CTA */}
      <Link
        to={`/bootcamps/${course.slug}`}
        className="mt-6 inline-block w-full rounded-lg bg-indigo-600/20 py-2 text-center text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-600 hover:text-white"
      >
        View Details
      </Link>
    </div>
  );
}
