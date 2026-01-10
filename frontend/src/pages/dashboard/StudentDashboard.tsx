import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import { enrollmentAPI } from '../../lib/api';


export default function StudentDashboard() {
  const { user } = useAuth();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // dynamic state
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  useEffect(() => {
    const name = user?.name?.split(' ')[0];
    setPageTitle(name ? `${name}’s Dashboard` : 'Dashboard');
  }, [user]);

  useEffect(() => {
    let mounted = true;
    setLoadingEnrollments(true);
    enrollmentAPI.getMy()
      .then((res) => {
        if (!mounted) return;
        setEnrollments(res.data.data.enrollments || []);
      })
      .catch(() => {
        if (!mounted) return;
        setEnrollments([]);
      })
      .finally(() => { if (mounted) setLoadingEnrollments(false); });
    return () => { mounted = false; };
  }, []);

  const enrolledCount = enrollments.length;
  const completedCount = enrollments.filter((e) => e.status === 'completed' || (typeof e.progress !== 'undefined' && e.progress >= 100)).length;
  const avgProgress = enrollments.length === 0 ? 0 : Math.round(enrollments.reduce((s, e) => s + (Number(e.progress) || 0), 0) / enrollments.length);


  const longestStreakValue = user ? (user.longestLoginStreak ?? 0) : (loadingEnrollments ? <Loader2 className="w-5 h-5 text-indigo-300 animate-spin" /> : '0');

  const stats = [
    { label: 'Enrolled Courses', value: String(enrolledCount), icon: BookOpen, color: 'text-indigo-400' },
    { label: 'Longest days streak', value: longestStreakValue, icon: TrendingUp, color: 'text-red-400' },
    { label: 'Certificates', value: String(completedCount), icon: Award, color: 'text-yellow-400' },
    { label: 'Progress', value: `${avgProgress}%`, icon: Clock, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-6">
      <SEO title={pageTitle} description="Overview of your learning progress and recent activity" />
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="mt-1 text-indigo-100">Continue your learning journey where you left off.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-4 border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-700/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Login Streak Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Daily login streak (last 30 days)</h3>
          <div className="text-xs text-gray-400">Longest: <span className="font-semibold text-white ml-1">{user?.longestLoginStreak ?? 0}</span></div>
        </div>
        {/* Compact calendar: day number centered, short month label in bottom-right of each cell */}
        {(() => {
          const days: string[] = [];
          const today = new Date();
          for (let i = 29; i >= 0; i--) {
            const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            d.setUTCDate(d.getUTCDate() - i);
            days.push(d.toISOString().slice(0,10));
          }

          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

          return (
            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => {
                const logged = (user?.loginDays || []).includes(d);
                const dayDt = new Date(d + 'T00:00:00Z');
                const dayNum = dayDt.getUTCDate();
                const monthShort = monthNames[dayDt.getUTCMonth()];
                const monthLabelClass = logged ? 'text-white/80' : 'text-gray-300';

                return (
                  <div
                    key={d}
                    title={`${d} - ${logged ? 'Logged in' : 'Missed'}`}
                    className={`w-8 h-8 rounded-sm relative flex items-center justify-center ${logged ? 'bg-green-700 text-white' : 'bg-gray-700/30 text-gray-300'}`}
                  >
                    <span className="text-xs font-medium">{dayNum}</span>
                    <span className={`absolute left-1/2 bottom-0 transform -translate-x-1/2 text-[9px] leading-none mb-0.5 ${monthLabelClass}`}>{monthShort}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
        <div className="mt-3 text-xs text-gray-400 flex items-center gap-3">
          <div className="w-4 h-4 bg-green-700 rounded-sm" />
          <span>Logged in</span>
          <div className="w-4 h-4 bg-gray-700/30 rounded-sm ml-4" />
          <span>Missed</span>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl border border-gray-700"
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Continue Learning</h2>
          <div className="text-sm text-indigo-400">{enrolledCount} courses</div>
        </div>
        <div className="p-4">
          {loadingEnrollments ? (
            <div className="py-6 text-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
          ) : enrollments.length === 0 ? (
            <div className="py-8 text-center text-gray-400">You are not enrolled in any courses yet.</div>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 4).map((e: any) => (
                <div key={e._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="font-medium text-white truncate">{e.course?.title || 'Course'}</h3>
                    <div className="text-xs text-gray-400 whitespace-normal">{e.course?.shortDescription}</div>
                  </div>
                  <div className="w-full sm:w-40 md:w-48 mt-3 sm:mt-0 flex-none">
                    <progress value={Math.min(100, Math.max(0, Number(e.progress) || 0))} max={100} className="w-full h-2 rounded appearance-none" />
                    <div className="text-xs text-gray-400 mt-2 flex items-center justify-between">
                      <span>{e.status?.charAt(0)?.toUpperCase() + (e.status?.slice(1) || '')}</span>
                      <Link to={`/dashboard/courses/${e._id}`} className="text-xs text-indigo-400 hover:text-indigo-300">Continue</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Placeholder for more content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center"
      >
        <p className="text-gray-400">More dashboard features coming soon...</p>
      </motion.div>
    </div>
  );
}
