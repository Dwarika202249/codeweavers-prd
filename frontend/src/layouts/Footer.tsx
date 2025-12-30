import { Link } from 'react-router-dom';
import { Code2, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { footerLinks } from '../data/navigation';
import { courseAPI, type Course } from '../lib/api';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const [popularCourses, setPopularCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    let mounted = true;
    courseAPI.getAll({ page: 1, limit: 8 })
      .then((res) => {
        if (!mounted) return;
        const courses: Course[] = res.data.data.courses || [];
        // Prefer featured courses; otherwise use first results
        const featured = courses.filter((c) => Boolean(c.featured));
        const chosen = (featured.length ? featured : courses).slice(0, 4);
        setPopularCourses(chosen);
      })
      .catch(() => {
        if (!mounted) return;
        setPopularCourses([]);
      });

    return () => { mounted = false; };
  }, []);

  return (
    <footer className="border-t border-gray-800 bg-gray-900" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
              aria-label="CodeWeavers - Home"
            >
              <Code2 className="h-8 w-8 text-indigo-500" aria-hidden="true" />
              <span>CodeWeavers</span>
            </Link>
            <p className="text-sm text-gray-400">
              Bridging the gap between academic learning and industry expectations through practical, project-driven tech training.
            </p>
            <nav aria-label="Social media links">
              <ul className="flex gap-4">
                {footerLinks.social.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 transition-colors hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                      aria-label={`Follow us on ${link.label}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-200">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Courses */}
          <nav aria-label="Popular courses">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-200">
              Popular Courses
            </h3>
            <ul className="space-y-2">
              {popularCourses && popularCourses.length > 0 ? (
                popularCourses.map((course) => (
                  <li key={course._id}>
                    <Link
                      to={course.slug ? `/bootcamps/${course.slug}` : `/bootcamps/${course._id}`}
                      className="text-sm text-gray-400 transition-colors hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded block truncate"
                      aria-label={`View ${course.title}`}
                    >
                      {course.title}
                    </Link>
                  </li>
                ))
              ) : (
                footerLinks.courses.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 transition-colors hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </nav>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-200">
              Contact
            </h3>
            <address className="not-italic">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" aria-hidden="true" />
                  <a 
                    href="mailto:contact@codeweavers.in"
                    className="hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  >
                    contact@codeweavers.in
                  </a>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" aria-hidden="true" />
                  <a 
                    href="tel:+919800000000"
                    className="hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  >
                    +91 98XXX XXXXX
                  </a>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" aria-hidden="true" />
                  <span>India (Remote Training Available)</span>
                </li>
              </ul>
            </address>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            © {currentYear} CodeWeavers. All rights reserved. Built with <span aria-label="love">❤️</span> for learners.
          </p>
        </div>
      </div>
    </footer>
  );
}
