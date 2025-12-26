import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const stats = [
  { label: 'Enrolled Courses', value: '3', icon: BookOpen, color: 'text-indigo-400' },
  { label: 'Hours Learned', value: '24', icon: Clock, color: 'text-green-400' },
  { label: 'Certificates', value: '1', icon: Award, color: 'text-yellow-400' },
  { label: 'Progress', value: '67%', icon: TrendingUp, color: 'text-pink-400' },
];

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white"
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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl border border-gray-700"
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Continue Learning</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
            <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">MERN Stack Bootcamp</h3>
              <p className="text-sm text-gray-400">Module 3: React Fundamentals</p>
              <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '67%' }} />
              </div>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
              Continue
            </button>
          </div>
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
