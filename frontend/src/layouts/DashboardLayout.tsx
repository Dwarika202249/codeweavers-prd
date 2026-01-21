import { useState, useEffect } from 'react';
import { NotificationsProvider } from '../contexts/NotificationContext';
import PageLoader from '../components/ui/PageLoader';
import NotificationsBell from '../components/NotificationsBell';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  MessageSquare,
  FileText,
  Quote,
  Home,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Toaster } from '../lib/toast';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'My Courses', to: '/dashboard/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Profile', to: '/dashboard/profile', icon: <User className="w-5 h-5" /> },
  { label: 'Settings', to: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
];

const collegeNavItems: NavItem[] = [
  { label: 'Dashboard', to: '/college', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Students', to: '/college/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Invites', to: '/college/invites', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Reports', to: '/college/reports', icon: <FileText className="w-5 h-5" /> },
  { label: 'Settings', to: '/college/settings', icon: <Settings className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Inquiries', to: '/admin/inquiries', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Users', to: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Enrollments', to: '/admin/enrollments', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Certificates', to: '/admin/certificates', icon: <FileText className="w-5 h-5" /> },
  { label: 'Assignments', to: '/admin/assignments', icon: <FileText className="w-5 h-5" /> },
  { label: 'Courses', to: '/admin/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Colleges', to: '/admin/colleges', icon: <Users className="w-5 h-5" /> },
  { label: 'Blog Posts', to: '/admin/blog', icon: <FileText className="w-5 h-5" /> },
  { label: 'Testimonials', to: '/admin/testimonials', icon: <Quote className="w-5 h-5" /> },
  { label: 'Settings', to: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

interface DashboardLayoutProps {
  variant?: 'student' | 'admin' | 'college';
}

export default function DashboardLayout({ variant = 'student' }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = variant === 'admin' ? adminNavItems : (variant === 'college' ? collegeNavItems : studentNavItems);
  const dashboardTitle = variant === 'admin' ? 'Admin Panel' : (variant === 'college' ? 'College Dashboard' : 'Student Dashboard');

  const [isRedirecting, setIsRedirecting] = useState(false);
  const location = useLocation();

  // Enforce role restrictions via effect (avoid calling navigate during render)
  useEffect(() => {
    if (!user) return;
    if (variant === 'college' && !['college_admin', 'tpo'].includes(user.role)) {
      // If a non-college admin somehow reached here, redirect them to their dashboard
      if (location.pathname !== '/dashboard') {
        setIsRedirecting(true);
        navigate('/dashboard', { replace: true });
      }
    }
  }, [variant, user, navigate, location.pathname]);

  useEffect(() => {
    if (!user) return;
    if (variant === 'student' && ['college_admin', 'tpo'].includes(user.role)) {
      if (location.pathname !== '/college') {
        setIsRedirecting(true);
        navigate('/college', { replace: true });
      }
    }
  }, [variant, user, navigate, location.pathname]);

  // Clear redirecting state when the location actually changes
  useEffect(() => {
    if (isRedirecting) {
      setIsRedirecting(false);
    }
  }, [location.pathname]);

  if (isRedirecting) return <PageLoader message="Redirecting..." />;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-gray-900">
        <Toaster />
        
        {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="text-indigo-500">Code</span>Weavers
          </NavLink>
          <button
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user?.name || 'Avatar'} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              variant === 'admin' ? 'bg-red-500/20 text-red-400' : (variant === 'college' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-indigo-500/20 text-indigo-400')
            }`}>
              {variant === 'admin' ? 'Admin' : (variant === 'college' ? 'College' : 'Student')}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {dashboardTitle}
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard' || item.to === '/admin'}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              {item.icon}
              {item.label}
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Site
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-gray-900/95 backdrop-blur border-b border-gray-800">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-white">{dashboardTitle}</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications & quick actions */}
              <NotificationsBell />
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                <span>Welcome,</span>
                <span className="font-medium text-white">{user?.name?.split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
    </NotificationsProvider>
  );
}
