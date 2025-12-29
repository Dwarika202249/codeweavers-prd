import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, CheckCircle, BookOpen, Calendar, Monitor, FolderCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import SEO from '../components/SEO';
import { CoursePageSchema } from '../components/JsonLd';
import PaymentPanel from '../components/PaymentPanel';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { courseAPI, type Course } from '../lib/api';
import { showSuccess } from '../lib/toastUtils';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const sessionId = params.get('session_id');

    if (status === 'success' && sessionId) {
      // Confirm session server-side and attempt to ensure enrollment exists
      (async () => {
        try {
          const res = await (await import('../lib/api')).paymentsAPI.getSession(sessionId);
          const enrollmentCreated = (res.data?.data as any)?.enrollmentCreated;
          if (enrollmentCreated) {
            showSuccess('Payment confirmed and enrollment created.');
          } else {
            showSuccess('Payment confirmed. Enrollment may take a moment to appear.');
          }
          // Notify payment panel to refresh (it listens for this event)
          window.dispatchEvent(new Event('enrollment-updated'));
          // Remove query params from URL to tidy up
          const url = new URL(window.location.href);
          url.searchParams.delete('status');
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url.toString());
        } catch (err) {
          console.warn('Failed to confirm session:', err);
          showSuccess('Payment confirmed; checking enrollment failed. It should appear in a few moments.');
        }
      })();
    }
  }, [location.search]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    courseAPI.getBySlug(slug)
      .then((res) => setCourse(res.data.data.course))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading…</div>;
  if (error || !course) {
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

  // derive display values with sensible fallbacks
  const difficultyLabel = course.level || course.difficulty || '';
  const modeLabel = course.mode || 'Online';

  return (
    <>
      <SEO 
        title={course.title}
        description={course.description}
      />
      <CoursePageSchema course={course as any} />
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
                difficultyLabel === 'Beginner' && 'bg-green-900/50 text-green-400',
                difficultyLabel === 'Intermediate' && 'bg-yellow-900/50 text-yellow-400',
                difficultyLabel === 'Advanced' && 'bg-red-900/50 text-red-400'
              )}>
                {difficultyLabel}
              </span>
              {course.featured && (
                <span className="rounded-full bg-indigo-900/50 px-3 py-1 text-sm font-medium text-indigo-400">
                  Featured
                </span>
              )}
              <span className="rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-gray-300">
                {modeLabel}
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-bold text-white">{course.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-400">
              <Users className="w-4 h-4 text-indigo-400" />
              <div>Instructor: <span className="font-medium text-white">{course.instructor || '—'}</span></div>
            </div>
            <p className="mt-4 text-lg text-gray-300">{course.description}</p>
          </motion.div>

          {(course.coverImageThumb || course.coverImage) && (
            <div className="mt-6">
              <img src={course.coverImageThumb || course.coverImage} alt={course.title} className="w-full h-56 rounded-lg object-cover" />
            </div>
          )}

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

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              {/* Curriculum Section */}
              {course.curriculum && course.curriculum.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className=""
                >
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-indigo-400" />
                    Curriculum Breakdown
                  </h2>
                  <div className="mt-6 space-y-4">
                    {course.curriculum?.map((module: any, index: number) => (
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
                              {module.topics?.map((topic: any, topicIndex: number) => (
                                <span
                                  key={topicIndex}
                                  className="inline-flex items-center whitespace-nowrap rounded-md bg-gray-800 px-2.5 py-1 text-sm text-gray-300"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>

                            {module.project && (
                              <div className="mt-4 flex justify-start">
                                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-900/20 px-3 py-2">
                                  <FolderCode className="h-4 w-4 text-green-400" />
                                  <span className="text-sm font-medium text-green-400">{module.project}</span>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Topics */}
              {course.topics && course.topics.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8"
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
              )}

            {/* Learning Outcomes */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-12"
              >
                <h2 className="text-2xl font-bold text-white">Learning Outcomes</h2>
                <ul className="mt-6 space-y-4">
                  {course.learningOutcomes?.map((outcome, index) => (
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
              {course.targetAudience && course.targetAudience.length > 0 && (
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
              )}
            </div>

            <aside className="md:col-span-1 self-start mt-6 md:mt-14">
              <PaymentPanel courseSlug={course.slug} price={course.price || 0} coverImage={course.coverImage} shortDescription={course.shortDescription} />
            </aside>
          </div>



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
            <Link to="/contact" className="mt-6 inline-block rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
              Contact Us
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
