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
const InviteSignupPage = lazy(() => import('../pages/InviteSignupPage'));
const CollegeSignupPage = lazy(() => import('../pages/CollegeSignupPage'));
const TermsPage = lazy(() => import('../pages/TermsPage'));
const PoliciesPage = lazy(() => import('../pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Dashboard pages
const StudentDashboard = lazy(() => import('../pages/dashboard/StudentDashboard'));
const CollegeDashboard = lazy(() => import('../pages/dashboard/CollegeDashboard'));
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));
const InquiriesPage = lazy(() => import('../pages/dashboard/InquiriesPage'));
const MyCoursesPage = lazy(() => import('../pages/dashboard/MyCoursesPage'));

// Placeholder pages for dashboard sections
const ComingSoonPage = lazy(() => import('../pages/dashboard').then(m => ({ default: m.ComingSoonPage })));
const CoursesPage = lazy(() => import('../pages/dashboard/CoursesPage'));
const InquiryDetailPage = lazy(() => import('../pages/dashboard/InquiryDetailPage'));
const ProfilePage = lazy(() => import('../pages/dashboard/ProfilePage'));
const UserSettingsPage = lazy(() => import('../pages/dashboard/UserSettingsPage'));
const EnrollmentDetailsPage = lazy(() => import('../pages/dashboard/EnrollmentDetailsPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminAuditsPage = lazy(() => import('../pages/admin/AdminAuditsPage'));
const AdminEnrollmentsPage = lazy(() => import('../pages/admin/AdminEnrollmentsPage'));
const AdminEnrollmentDetailPage = lazy(() => import('../pages/admin/AdminEnrollmentDetailPage'));
const AdminCertificatesPage = lazy(() => import('../pages/admin/AdminCertificatesPage'));
const AdminCertificateDetailPage = lazy(() => import('../pages/admin/AdminCertificateDetailPage'));
const AdminCourseForm = lazy(() => import('../pages/admin/AdminCourseForm'));
const AdminAssignmentsPage = lazy(() => import('../pages/admin/AdminAssignmentsPage'));
const AdminAssignmentDetailPage = lazy(() => import('../pages/admin/AdminAssignmentDetailPage'));
const AdminCollegesPage = lazy(() => import('../pages/admin/AdminCollegesPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));

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
        path: 'invite',
        element: <LazyPage><InviteSignupPage /></LazyPage>,
      },
      {
        path: 'colleges/signup',
        element: <LazyPage><CollegeSignupPage /></LazyPage>,
      },
      {
        path: 'terms',
        element: <LazyPage><TermsPage /></LazyPage>,
      },
      {
        path: 'policies',
        element: <LazyPage><PoliciesPage /></LazyPage>,
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
        element: <LazyPage><EnrollmentDetailsPage /></LazyPage>,
      },
      {
        path: 'profile',
        element: <LazyPage><ProfilePage /></LazyPage>,
      },
      {
        path: 'settings',
        element: <LazyPage><UserSettingsPage /></LazyPage>,
      },
    ],
  },
  // College Dashboard Routes (Protected - College Admin / TPO)
  {
    path: '/college',
    element: (
      <ProtectedRoute>
        <DashboardLayout variant="college" />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <LazyPage><CollegeDashboard /></LazyPage> },
      { path: 'students', element: <LazyPage><ComingSoonPage title="Students" /></LazyPage> },
      { path: 'invites', element: <LazyPage><AdminCollegesPage /></LazyPage> },
      { path: 'reports', element: <LazyPage><ComingSoonPage title="Reports" /></LazyPage> },
      { path: 'settings', element: <LazyPage><ComingSoonPage title="Settings" /></LazyPage> },
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
      {        path: 'colleges',
        element: <LazyPage><AdminCollegesPage /></LazyPage>,
      },
      {        path: 'assignments',
        element: <LazyPage><AdminAssignmentsPage /></LazyPage>,
      },
      {        path: 'assignments/:id',
        element: <LazyPage><AdminAssignmentDetailPage /></LazyPage>,
      },
      {        path: 'enrollments',
        element: <LazyPage><AdminEnrollmentsPage /></LazyPage>,
      },
      {        path: 'enrollments/:id',
        element: <LazyPage><AdminEnrollmentDetailPage /></LazyPage>,
      },
      {        path: 'certificates',
        element: <LazyPage><AdminCertificatesPage /></LazyPage>,
      },
      {        path: 'certificates/:id',
        element: <LazyPage><AdminCertificateDetailPage /></LazyPage>,
      },
      {
        path: 'courses/new',
        element: <LazyPage><AdminCourseForm /></LazyPage>,
      },
      {
        path: 'courses/:id/edit',
        element: <LazyPage><AdminCourseForm /></LazyPage>,
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
        element: <LazyPage><AdminSettingsPage /></LazyPage>,
      },
    ],
  },
]);
