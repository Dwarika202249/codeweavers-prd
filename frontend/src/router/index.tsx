import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout, DashboardLayout } from '../layouts';
import { LazyPage } from '../components/LazyPage';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load pages for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const BootcampsPage = lazy(() => import('../pages/BootcampsPage'));
const CourseDetailPage = lazy(() => import('../pages/CourseDetailPage'));
const MethodologyPage = lazy(() => import('../pages/MethodologyPage'));
const ExperiencePage = lazy(() => import('../pages/ExperiencePage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const BlogPage = lazy(() => import('../pages/BlogPage'));
const BlogDetailPage = lazy(() => import('../pages/BlogDetailPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Dashboard pages
const StudentDashboard = lazy(() => import('../pages/dashboard/StudentDashboard'));
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));
const InquiriesPage = lazy(() => import('../pages/dashboard/InquiriesPage'));
const MyCoursesPage = lazy(() => import('../pages/dashboard/MyCoursesPage'));

// Placeholder pages for dashboard sections
const ComingSoonPage = lazy(() => import('../pages/dashboard/ComingSoonPage'));
const CoursesPage = lazy(() => import('../pages/dashboard/CoursesPage'));
const InquiryDetailPage = lazy(() => import('../pages/dashboard/InquiryDetailPage'));
const ProfilePage = lazy(() => import('../pages/dashboard/ProfilePage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminAuditsPage = lazy(() => import('../pages/admin/AdminAuditsPage'));
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LazyPage><HomePage /></LazyPage>,
      },
      {
        path: 'about',
        element: <LazyPage><AboutPage /></LazyPage>,
      },
      {
        path: 'bootcamps',
        element: <LazyPage><BootcampsPage /></LazyPage>,
      },
      {
        path: 'bootcamps/:slug',
        element: <LazyPage><CourseDetailPage /></LazyPage>,
      },
      {
        path: 'methodology',
        element: <LazyPage><MethodologyPage /></LazyPage>,
      },
      {
        path: 'experience',
        element: <LazyPage><ExperiencePage /></LazyPage>,
      },
      {
        path: 'blog',
        element: <LazyPage><BlogPage /></LazyPage>,
      },
      {
        path: 'blog/:slug',
        element: <LazyPage><BlogDetailPage /></LazyPage>,
      },
      {
        path: 'contact',
        element: <LazyPage><ContactPage /></LazyPage>,
      },
      {
        path: 'login',
        element: <LazyPage><LoginPage /></LazyPage>,
      },
      {
        path: 'register',
        element: <LazyPage><RegisterPage /></LazyPage>,
      },
      {
        path: '*',
        element: <LazyPage><NotFoundPage /></LazyPage>,
      },
    ],
  },
  // Student Dashboard Routes (Protected)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout variant="student" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LazyPage><StudentDashboard /></LazyPage>,
      },
      {
        path: 'courses',
        element: <LazyPage><MyCoursesPage /></LazyPage>,
      },
      {
        path: 'courses/:id',
        element: <LazyPage><ComingSoonPage title="Enrollment Details" /></LazyPage>,
      },
      {
        path: 'profile',
        element: <LazyPage><ProfilePage /></LazyPage>,
      },
      {
        path: 'settings',
        element: <LazyPage><ComingSoonPage title="Settings" /></LazyPage>,
      },
    ],
  },
  // Admin Dashboard Routes (Protected - Admin Only)
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout variant="admin" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LazyPage><AdminDashboard /></LazyPage>,
      },
      {
        path: 'inquiries',
        element: <LazyPage><InquiriesPage /></LazyPage>,
      },
      {
        path: 'inquiries/:id',
        element: <LazyPage><InquiryDetailPage /></LazyPage>,
      },
      {
        path: 'users',
        element: <LazyPage><AdminUsersPage /></LazyPage>,
      },
      {        path: 'audits',
        element: <LazyPage><AdminAuditsPage /></LazyPage>,
      },
      {        path: 'courses',
        element: <LazyPage><CoursesPage /></LazyPage>,
      },
      {
        path: 'blog',
        element: <LazyPage><ComingSoonPage title="Blog Posts" /></LazyPage>,
      },
      {
        path: 'testimonials',
        element: <LazyPage><ComingSoonPage title="Testimonials" /></LazyPage>,
      },
      {
        path: 'settings',
        element: <LazyPage><ComingSoonPage title="Admin Settings" /></LazyPage>,
      },
    ],
  },
]);
