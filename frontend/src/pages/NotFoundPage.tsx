import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Section, Container, Button } from '../components';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  return (
    <>
      <SEO 
        title="Page Not Found | CodeWeavers"
        description="The page you're looking for doesn't exist. Return to CodeWeavers homepage to explore our tech training bootcamps and courses."
      />
      <Section background="gradient" className="min-h-[80vh] flex items-center">
        <Container size="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
            role="main"
            aria-labelledby="error-title"
          >
            {/* 404 Number */}
            <div className="relative" aria-hidden="true">
              <h1 className="text-[150px] font-bold leading-none text-gray-800 sm:text-[200px]">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">🔍</span>
              </div>
            </div>

            {/* Message */}
            <h2 id="error-title" className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Page Not Found
            </h2>
            <p className="mx-auto mt-4 max-w-md text-gray-400">
              Oops! The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/">
                <Button size="lg">
                  <Home className="h-5 w-5" aria-hidden="true" />
                  Back to Home
                </Button>
              </Link>
              <Link to="/bootcamps">
                <Button variant="outline" size="lg">
                  <Search className="h-5 w-5" aria-hidden="true" />
                  Browse Bootcamps
                </Button>
              </Link>
            </div>

            {/* Quick Links */}
            <nav className="mt-12 border-t border-gray-800 pt-8" aria-label="Helpful pages">
              <p className="text-sm text-gray-500">Or try these popular pages:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Link
                  to="/about"
                  className="text-sm text-gray-400 transition-colors hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  About the Trainer
                </Link>
                <span className="text-gray-700" aria-hidden="true">•</span>
                <Link
                  to="/methodology"
                  className="text-sm text-gray-400 transition-colors hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  Teaching Methodology
                </Link>
                <span className="text-gray-700" aria-hidden="true">•</span>
                <Link
                  to="/contact"
                  className="text-sm text-gray-400 transition-colors hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  Contact
                </Link>
              </div>
            </nav>
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
