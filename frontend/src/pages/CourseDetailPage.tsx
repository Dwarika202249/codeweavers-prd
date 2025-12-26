import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, CheckCircle, BookOpen, Calendar, Monitor, FolderCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCourseBySlug } from '../data/courses';
import { cn } from '../lib/utils';
import SEO from '../components/SEO';
import { CoursePageSchema } from '../components/JsonLd';

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
    <>
      <SEO 
        title={course.title}
        description={course.description}
      />
      <CoursePageSchema course={course} />
      <div className="min-h-screen py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            to="/bootcamps"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bootcamps
          </Link>

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
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
              {course.mode && (
                <span className="rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-gray-300">
                  {course.mode}
                </span>
              )}
            </div>
            <h1 className="mt-4 text-4xl font-bold text-white">{course.title}</h1>
            <p className="mt-4 text-lg text-gray-300">{course.description}</p>
          </motion.div>

          {/* Quick Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
              <Clock className="h-5 w-5 shrink-0 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-medium text-white">{course.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
              <Users className="h-5 w-5 shrink-0 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-400">Batch Size</p>
                <p className="font-medium text-white">{course.batchSize || '10-15 students'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
              <Calendar className="h-5 w-5 shrink-0 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-400">Schedule</p>
                <p className="font-medium text-white text-sm">{course.schedule || 'Flexible'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
              <Monitor className="h-5 w-5 shrink-0 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-400">Mode</p>
                <p className="font-medium text-white">{course.mode || 'Online'}</p>
              </div>
            </div>
          </motion.div>

          {/* Curriculum Section */}
          {course.curriculum && course.curriculum.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-indigo-400" />
                Curriculum Breakdown
              </h2>
              <div className="mt-6 space-y-4">
                {course.curriculum.map((module, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="group rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-indigo-500/50"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="rounded-lg bg-indigo-600 px-3 py-1 text-sm font-semibold text-white">
                            {module.week}
                          </span>
                          <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {module.topics.map((topic, topicIndex) => (
                            <span
                              key={topicIndex}
                              className="rounded-md bg-gray-800 px-2.5 py-1 text-sm text-gray-300"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      {module.project && (
                        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-900/20 px-3 py-2 sm:shrink-0">
                          <FolderCode className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium text-green-400">{module.project}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Topics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-white">Technologies & Tools</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {course.topics.map((topic) => (
                <span key={topic} className="rounded-lg bg-gray-800 px-4 py-2 text-gray-200">
                  {topic}
                </span>
              ))}
            </div>
          </motion.div>

        {/* Learning Outcomes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-white">Learning Outcomes</h2>
            <ul className="mt-6 space-y-4">
              {course.learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  <span className="text-gray-300">{outcome}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-white">Prerequisites</h2>
              <ul className="mt-6 space-y-2">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Target Audience */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-white">Who Is This For?</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {course.targetAudience.map((audience) => (
                <span key={audience} className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-200">
                  {audience}
                </span>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-16 rounded-xl border border-indigo-500/30 bg-linear-to-r from-indigo-900/50 to-purple-900/50 p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-white">Ready to Get Started?</h3>
            <p className="mt-2 text-gray-300">
              Contact me to discuss enrollment and customize the program for your needs.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              Enroll Now
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
