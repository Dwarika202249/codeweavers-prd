import type { Testimonial } from '../../types';
import { cn } from '../../lib/utils';
import { AvatarImage } from './OptimizedImage';

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

export default function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-800 bg-gray-900 p-6',
        className
      )}
    >
      {/* Rating */}
      <div className="flex gap-1">
        {[...Array(testimonial.rating || 5)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
      </div>

      {/* Content */}
      <p className="mt-4 text-gray-300 italic">"{testimonial.content}"</p>

      {/* Author */}
      <div className="mt-6 flex items-center gap-4 border-t border-gray-800 pt-4">
        <AvatarImage
          src={testimonial.avatar}
          alt={testimonial.name}
          size="md"
          className="h-10 w-10"
        />
        <div>
          <p className="font-medium text-white">{testimonial.name}</p>
          <p className="text-sm text-gray-400">
            {testimonial.role}
            {testimonial.organization && ` @ ${testimonial.organization}`}
          </p>
        </div>
      </div>
    </div>
  );
}
