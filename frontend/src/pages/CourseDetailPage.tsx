import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, CheckCircle, BookOpen } from 'lucide-react';
import { getCourseBySlug } from '../data/courses';
import { cn } from '../lib/utils';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const course = slug ? getCourseBySlug(slug) : undefined;

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Course Not Found</h1>
          <Link to="/bootcamps" className="mt-4 inline-block text-indigo-400 hover:underline">
            ← Back to Bootcamps
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/bootcamps"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bootcamps
        </Link>

        {/* Header */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn(
              'rounded-full px-3 py-1 text-sm font-medium',
              course.difficulty === 'Beginner' && 'bg-green-900/50 text-green-400',
              course.difficulty === 'Intermediate' && 'bg-yellow-900/50 text-yellow-400',
              course.difficulty === 'Advanced' && 'bg-red-900/50 text-red-400'
            )}>
              {course.difficulty}
            </span>
            {course.featured && (
              <span className="rounded-full bg-indigo-900/50 px-3 py-1 text-sm font-medium text-indigo-400">
                Featured
              </span>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-bold text-white">{course.title}</h1>
          <p className="mt-4 text-lg text-gray-300">{course.description}</p>
        </div>

        {/* Quick Info */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
            <Clock className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-sm text-gray-400">Duration</p>
              <p className="font-medium text-white">{course.duration}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
            <Users className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-sm text-gray-400">Target Audience</p>
              <p className="font-medium text-white">{course.targetAudience[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-sm text-gray-400">Topics Covered</p>
              <p className="font-medium text-white">{course.topics.length} Topics</p>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white">What You'll Learn</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {course.topics.map((topic) => (
              <span key={topic} className="rounded-lg bg-gray-800 px-4 py-2 text-gray-200">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white">Learning Outcomes</h2>
          <ul className="mt-6 space-y-4">
            {course.learningOutcomes.map((outcome, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                <span className="text-gray-300">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white">Prerequisites</h2>
            <ul className="mt-6 space-y-2">
              {course.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  {prereq}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Target Audience */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white">Who Is This For?</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {course.targetAudience.map((audience) => (
              <span key={audience} className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-200">
                {audience}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-8 text-center">
          <h3 className="text-2xl font-bold text-white">Ready to Get Started?</h3>
          <p className="mt-2 text-gray-300">
            Contact me to discuss enrollment and customize the program for your needs.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </div>
  );
}
