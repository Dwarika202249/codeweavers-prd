import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts';
import { LazyPage } from '../components/LazyPage';

// Lazy load pages for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const BootcampsPage = lazy(() => import('../pages/BootcampsPage'));
const CourseDetailPage = lazy(() => import('../pages/CourseDetailPage'));
const MethodologyPage = lazy(() => import('../pages/MethodologyPage'));
const ExperiencePage = lazy(() => import('../pages/ExperiencePage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const BlogPage = lazy(() => import('../pages/BlogPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

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
        path: 'contact',
        element: <LazyPage><ContactPage /></LazyPage>,
      },
      {
        path: '*',
        element: <LazyPage><NotFoundPage /></LazyPage>,
      },
    ],
  },
]);
