import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userAdminAPI, contactAPI } from '../../lib/api';
import SEO from '../../components/SEO';

const stats = [
  { 
    label: 'Total Users', 
    value: '—', 
    change: null, 
    trend: 'neutral',
    icon: Users, 
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    key: 'total'
  },
  { 
    label: 'Active Users', 
    value: '—', 
    change: null, 
    trend: 'neutral',
    icon: Users, 
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    key: 'active'
  },
  { 
    label: 'Admins', 
    value: '—', 
    change: null, 
    trend: 'neutral',
    icon: Users, 
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    key: 'admins'
  },
  { 
    label: 'New Users (30d)', 
    value: '—', 
    change: null, 
    trend: 'neutral',
    icon: TrendingUp, 
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    key: 'newUsersLast30Days'
  },
];

const RECENT_LIMIT = 3;

export default function AdminDashboard() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any | null>(null);
  const [pageTitle, setPageTitle] = useState('Admin Dashboard');
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);

  // Helper to display relative time (e.g., "2 hours ago")
  const timeAgo = (input?: string | number | Date) => {
    if (!input) return '';
    const then = new Date(input).getTime();
    if (Number.isNaN(then)) return '';
    const diff = Date.now() - then;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  };

  useEffect(() => {
    if (statsData && typeof statsData.total === 'number') {
      setPageTitle(`Admin Dashboard — ${statsData.total} users`);
    }
  }, [statsData]);

  useEffect(() => {
    userAdminAPI.stats()
      .then((res) => setStatsData(res.data.data.stats))
      .catch(() => {});

    // Fetch recent inquiries
    let mounted = true;
    (async () => {
      try {
        const res = await contactAPI.getAll({ page: 1, limit: RECENT_LIMIT });
        if (!mounted) return;
        setRecentInquiries(res.data.data.contacts || []);
      } catch (err) {
        // ignore errors - show nothing
        console.warn('Failed to fetch recent inquiries', err);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <SEO title={pageTitle} description="Admin overview and quick actions" />
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
            <p className="text-2xl font-bold text-white">{statsData ? statsData[stat.key] : stat.value}</p>
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
            <div key={inquiry._id || inquiry.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
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
                <p className="text-xs text-gray-500">{timeAgo(inquiry.createdAt || inquiry.time)}</p>
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
