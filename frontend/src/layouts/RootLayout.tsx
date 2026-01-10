import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { SEO } from '../components';
import ScrollToTop from '../components/ScrollToTop';
import { Toaster } from '../lib/toast';
import { usePageTracking } from '../hooks/usePageTracking';

export default function RootLayout() {
  // Track page views for analytics
  usePageTracking();

  const location = useLocation();
  // Hide global chrome (navbar/footer) on auth pages for a focused auth experience
  const hideChromeFor = ['/login', '/register', '/terms', '/policies'];
  const hideChrome = hideChromeFor.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      <ScrollToTop />
      <Toaster />
      <SEO />
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {!hideChrome && <Navbar />}

      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
}
