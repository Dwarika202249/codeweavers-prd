import { motion } from 'framer-motion';
import { Users, MessageSquare, BookOpen, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const stats = [
  { 
    label: 'Total Users', 
    value: '156', 
    change: '+12%', 
    trend: 'up',
    icon: Users, 
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10'
  },
  { 
    label: 'New Inquiries', 
    value: '23', 
    change: '+8%', 
    trend: 'up',
    icon: MessageSquare, 
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  { 
    label: 'Active Courses', 
    value: '8', 
    change: '0%', 
    trend: 'neutral',
    icon: BookOpen, 
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10'
  },
  { 
    label: 'Enrollments', 
    value: '89', 
    change: '-3%', 
    trend: 'down',
    icon: TrendingUp, 
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10'
  },
];

const recentInquiries = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', subject: 'Course Inquiry', time: '2 hours ago' },
  { id: 2, name: 'Priya Patel', email: 'priya@example.com', subject: 'Collaboration', time: '5 hours ago' },
  { id: 3, name: 'Amit Kumar', email: 'amit@example.com', subject: 'General Question', time: '1 day ago' },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold">Admin Dashboard 🛠️</h1>
        <p className="mt-1 text-red-100">Welcome back, {user?.name}. Here's what's happening today.</p>
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
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-400' : 
                stat.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {stat.change}
                {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4 ml-1" />}
                {stat.trend === 'down' && <ArrowDownRight className="w-4 h-4 ml-1" />}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Inquiries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl border border-gray-700"
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Inquiries</h2>
          <a href="/admin/inquiries" className="text-sm text-indigo-400 hover:text-indigo-300">
            View all →
          </a>
        </div>
        <div className="divide-y divide-gray-700">
          {recentInquiries.map((inquiry) => (
            <div key={inquiry.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                  {inquiry.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{inquiry.name}</p>
                  <p className="text-sm text-gray-400">{inquiry.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-300">{inquiry.subject}</p>
                <p className="text-xs text-gray-500">{inquiry.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Add Course', href: '/admin/courses/new' },
          { label: 'New Blog Post', href: '/admin/blog/new' },
          { label: 'Manage Users', href: '/admin/users' },
          { label: 'View Reports', href: '/admin/reports' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center hover:bg-gray-700/50 hover:border-indigo-500/50 transition-all"
          >
            <p className="font-medium text-white">{action.label}</p>
          </a>
        ))}
      </motion.div>
    </div>
  );
}
