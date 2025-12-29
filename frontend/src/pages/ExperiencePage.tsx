import { experiences } from '../data/experience';
import { testimonials } from '../data/testimonials';
import { cn } from '../lib/utils';

export default function ExperiencePage() {
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Experience & Testimonials</h1>
          <p className="mt-4 text-lg text-gray-400">
            A journey of industry work and passionate mentorship
          </p>
        </div>

        {/* Timeline */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-white">Career Timeline</h2>
          <div className="mt-12 space-y-8">
            {experiences.map((exp, index) => (
              <div
                key={exp.id}
                className={cn(
                  'relative rounded-xl border border-gray-800 bg-gray-900 p-6',
                  'before:absolute before:-left-3 before:top-8 before:h-3 before:w-3 before:rounded-full before:bg-indigo-500',
                  index < experiences.length - 1 && 'after:absolute after:-left-1.5 after:top-12 after:h-full after:w-0.5 after:bg-gray-700'
                )}
              >
                <div className="ml-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium',
                      exp.type === 'internship' && 'bg-teal-900/50 text-teal-400',
                      exp.type === 'industry' && 'bg-blue-900/50 text-blue-400',
                      exp.type === 'teaching' && 'bg-green-900/50 text-green-400',
                      exp.type === 'mentoring' && 'bg-purple-900/50 text-purple-400'
                    )}>
                      {exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{exp.period}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-white">{exp.title}</h3>
                  <p className="text-indigo-400">{exp.organization}</p>
                  <p className="mt-3 text-gray-300">{exp.description}</p>
                  <ul className="mt-4 space-y-2">
                    {exp.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold text-white">What Students Say</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6"
              >
                <div className="flex gap-1">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="mt-4 text-gray-300 italic">"{testimonial.content}"</p>
                <div className="mt-6 border-t border-gray-800 pt-4">
                  <p className="font-medium text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">
                    {testimonial.role}
                    {testimonial.organization && ` @ ${testimonial.organization}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Stats */}
        <div className="mt-24 rounded-xl border border-indigo-500/30 bg-linear-to-r from-indigo-900/30 to-purple-900/30 p-8">
          <h3 className="text-center text-2xl font-bold text-white">Impact by Numbers</h3>
          <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-400">50+</p>
              <p className="mt-1 text-gray-400">Students Mentored</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-400">3+</p>
              <p className="mt-1 text-gray-400">Years Teaching</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-400">90%</p>
              <p className="mt-1 text-gray-400">Student Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-400">20+</p>
              <p className="mt-1 text-gray-400">Projects Guided</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
