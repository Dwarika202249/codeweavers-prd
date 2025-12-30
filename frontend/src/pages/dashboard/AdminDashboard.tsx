import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userAdminAPI, contactAPI } from '../../lib/api';
import SEO from '../../components/SEO';
import ReactApexChart from 'react-apexcharts';

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

  const [trendData, setTrendData] = useState<{ categories: string[]; series: any[] } | null>(null);
  const [enrollmentsTrend, setEnrollmentsTrend] = useState<{ categories: string[]; series: any[] } | null>(null);

  const chartOptions = (data: { categories: string[] } | null, color = '#60A5FA') => data ? {
    chart: { id: 'chart', toolbar: { show: false }, zoom: { enabled: false } },
    xaxis: { categories: data.categories, labels: { rotate: -45, style: { colors: '#9CA3AF' } } },
    grid: { strokeDashArray: 4 },
    stroke: { curve: 'smooth', width: 2 },
    colors: [color],
    tooltip: { x: { format: 'yyyy-MM-dd' } },
  } : {} as any;

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

  // Per-chart range state and fetchers (defaults = 7 days)
  const [newUsersDaysRange, setNewUsersDaysRange] = useState<number>(7);
  const [enrollmentsDaysRange, setEnrollmentsDaysRange] = useState<number>(7);
  const [topCoursesDaysRange, setTopCoursesDaysRange] = useState<number>(7);
  const [topCourses, setTopCourses] = useState<any[] | null>(null);

  // Revenue chart state
  const [revenueTrend, setRevenueTrend] = useState<{ categories: string[]; series: any[] } | null>(null);
  const [revenueDaysRange, setRevenueDaysRange] = useState<number>(7);

  const fetchNewUsers = async (days: number) => {
    try {
      const res = await userAdminAPI.newUsersTrend({ days });
      const daysArr = res.data.data.days || [];
      setTrendData({ categories: daysArr.map((d: any) => d.date), series: [{ name: 'New Users', data: daysArr.map((d: any) => d.count) }] });
    } catch (err) {
      console.warn('Failed to fetch new users trend', err);
    }
  };

  const fetchEnrollments = async (days: number) => {
    try {
      const res = await (await import('../../lib/api')).enrollmentAPI.dailyTrend({ days });
      const daysArr = res.data.data.days || [];
      setEnrollmentsTrend({ categories: daysArr.map((d: any) => d.date), series: [{ name: 'Enrollments', data: daysArr.map((d: any) => d.count) }] });
    } catch (err) {
      console.warn('Failed to fetch enrollments trend', err);
    }
  };

  const fetchTopCourses = async (days: number) => {
    try {
      const res = await (await import('../../lib/api')).courseAPI.topByEnrollments({ days, limit: 8 });
      const top = res.data.data.top || [];
      setTopCourses(top);
    } catch (err) {
      console.warn('Failed to fetch top courses', err);
    }
  };

  const fetchRevenue = async (days: number) => {
    try {
      const res = await (await import('../../lib/api')).paymentsAPI.revenueTrend({ days });
      const daysArr = res.data.data.days || [];
      setRevenueTrend({ categories: daysArr.map((d: any) => d.date), series: [{ name: 'Revenue', data: daysArr.map((d: any) => d.revenue) }] });
    } catch (err) {
      console.warn('Failed to fetch revenue trend', err);
    }
  };

  // Per-chart effects: run on mount and when ranges / course filter change
  useEffect(() => { fetchNewUsers(newUsersDaysRange); }, [newUsersDaysRange]);
  useEffect(() => { fetchEnrollments(enrollmentsDaysRange); }, [enrollmentsDaysRange]);
  useEffect(() => { fetchTopCourses(topCoursesDaysRange); }, [topCoursesDaysRange]);
  useEffect(() => { fetchRevenue(revenueDaysRange); }, [revenueDaysRange]);

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

      {/* Charts Grid (2 per row on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* New Users Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">New users</h2>
            <div className="text-sm text-gray-400">Last {newUsersDaysRange} days</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">Range:</div>
            {[7,30,90].map((d) => (
              <button
                key={d}
                onClick={() => setNewUsersDaysRange(d)}
                className={`text-sm px-2 py-1 rounded ${newUsersDaysRange===d ? 'bg-indigo-600 text-white' : 'text-gray-400 bg-gray-700/30'}`}
              >{d}d</button>
            ))}

          </div>
        </div>
        <div className="w-full h-48">
          {trendData ? (
            <ReactApexChart options={chartOptions(trendData)} series={trendData.series} type="area" height={180} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">Loading chart…</div>
          )}
        </div>
      </motion.div>

      {/* Enrollments Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Enrollments</h2>
            <div className="text-sm text-gray-400">Last {enrollmentsDaysRange} days</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">Range:</div>
            {[7,30,90].map((d) => (
              <button
                key={d}
                onClick={() => setEnrollmentsDaysRange(d)}
                className={`text-sm px-2 py-1 rounded ${enrollmentsDaysRange===d ? 'bg-indigo-600 text-white' : 'text-gray-400 bg-gray-700/30'}`}
              >{d}d</button>
            ))}
          </div>
        </div>
        <div className="w-full h-48">
          {enrollmentsTrend ? (
            <ReactApexChart options={chartOptions(enrollmentsTrend, '#34D399')} series={enrollmentsTrend.series} type="area" height={180} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">Loading chart…</div>
          )}
        </div>
      </motion.div>

      {/* Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.385 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Revenue</h2>
            <div className="text-sm text-gray-400">Last {revenueDaysRange} days</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">Range:</div>
            {[7,30,90].map((d) => (
              <button
                key={d}
                onClick={() => setRevenueDaysRange(d)}
                className={`text-sm px-2 py-1 rounded ${revenueDaysRange===d ? 'bg-indigo-600 text-white' : 'text-gray-400 bg-gray-700/30'}`}
              >{d}d</button>
            ))}
          </div>
        </div>
        <div className="w-full h-48">
          {revenueTrend ? (
            <ReactApexChart
              options={{
                ...chartOptions(revenueTrend, '#F59E0B'),
                yaxis: [{ labels: { formatter: (val: number) => `₹${Number(val).toLocaleString()}` } }],
                tooltip: { y: { formatter: (val: number) => `₹${Number(val).toLocaleString()}` } },
              }}
              series={revenueTrend.series}
              type="area"
              height={180}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">Loading revenue…</div>
          )}
        </div>
      </motion.div>

      {/* Top Courses by Enrollments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.37 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-4"
      >        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Top courses</h2>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">Last {topCoursesDaysRange} days</div>
            {[7,30,90].map((d) => (
              <button
                key={d}
                onClick={() => setTopCoursesDaysRange(d)}
                className={`text-sm px-2 py-1 rounded ${topCoursesDaysRange===d ? 'bg-indigo-600 text-white' : 'text-gray-400 bg-gray-700/30'}`}
              >{d}d</button>
            ))}
          </div>
        </div>
        <div className="w-full h-48">
          {topCourses ? (
            <ReactApexChart
              options={{
                chart: { id: 'top-courses', toolbar: { show: false } },
                plotOptions: { bar: { horizontal: true } },
                xaxis: { labels: { style: { colors: '#9CA3AF' } } },
              }}
              series={[{ name: 'Enrollments', data: topCourses.map((t: any) => t.count) }]}
              type="bar"
              height={220}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">Loading top courses…</div>
          )}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2">
          {topCourses && topCourses.map((t: any) => (
            <div
              key={t.courseId}
              className="w-full text-left text-sm px-3 py-2 rounded bg-gray-700/30 text-gray-300"
              title={`${t.title || 'Course'} — ${t.count} enrollments`}
            >
              <div className="flex items-center justify-between">
                <div className="truncate">{t.title || t.slug || t.courseId}</div>
                <div className="text-xs text-gray-400">{t.count}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
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
