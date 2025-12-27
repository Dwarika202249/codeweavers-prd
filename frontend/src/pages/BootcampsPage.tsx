import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { courseAPI, type Course } from '../lib/api';

type DifficultyFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

export default function BootcampsPage() {
  const [filter, setFilter] = useState<DifficultyFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: any = { page: 1, limit: 100, published: true };
    if (searchQuery) params.q = searchQuery;
    if (filter && filter !== 'All') params.level = filter;
    courseAPI.getAll(params)
      .then((res) => setCourses(res.data.data.courses))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [searchQuery, filter]);

  const difficulties: DifficultyFilter[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Bootcamps & Courses</h1>
          <p className="mt-4 text-lg text-gray-400">
            Practical, industry-focused training to accelerate your tech career
          </p>
        </div>

        {/* Filters */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {difficulties.map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  filter === level
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="text-gray-400">Loading courses...</div>
          ) : courses.map((course) => (
            <div
              key={course._id}
              className="group rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <span className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  course.level === 'Beginner' && 'bg-green-900/50 text-green-400',
                  course.level === 'Intermediate' && 'bg-yellow-900/50 text-yellow-400',
                  course.level === 'Advanced' && 'bg-red-900/50 text-red-400'
                )}>
                  {course.level}
                </span>
                <span className="text-sm text-gray-500">{course.duration}</span>
              </div>

              {/* Content */}
              <h3 className="mt-4 text-xl font-semibold text-white group-hover:text-indigo-400">
                {course.title}
              </h3>
              <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                {course.description || course.shortDescription}
              </p>

              {/* Technologies (topics) */}
              <div className="mt-4 flex flex-wrap gap-2">
                {((course.topics && course.topics.length > 0 ? course.topics : (course.learningOutcomes || []))).slice(0, 4).map((topic) => (
                  <span key={topic} className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300">
                    {topic}
                  </span>
                ))}
                {((course.topics && course.topics.length > 0 ? course.topics : (course.learningOutcomes || []))).length > 4 && (
                  <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-500">
                    +{((course.topics && course.topics.length > 0 ? course.topics : (course.learningOutcomes || []))).length - 4} more
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
          ))}

        {(!loading && courses.length === 0) && (
          <div className="mt-12 text-center text-gray-500">
            No courses found matching your criteria.
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
