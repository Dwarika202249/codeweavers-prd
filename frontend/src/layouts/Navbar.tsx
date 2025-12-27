import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code2, User, LogOut, LayoutDashboard } from 'lucide-react';
import { navItems } from '../data/navigation';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close mobile menu handler
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
      <nav 
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 rounded-lg"
          aria-label="CodeWeavers - Home"
        >
          <Code2 className="h-8 w-8 text-indigo-500" aria-hidden="true" />
          <span>CodeWeavers</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 block',
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          {/* Auth Buttons */}
          <li className="ml-2 pl-2 border-l border-gray-700">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden lg:inline">{user?.role === 'admin' ? 'Admin' : 'Dashboard'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                Sign In
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav 
          id="mobile-menu"
          className="border-t border-gray-800 md:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={closeMenu}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                    'block rounded-lg px-4 py-2 text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
                </li>
              );
            })}
            {/* Mobile Auth */}
            <li className="pt-2 mt-2 border-t border-gray-800">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={closeMenu}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                    {user?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={() => { logout(); closeMenu(); }}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    Sign Out ({user?.name?.split(' ')[0]})
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  Sign In
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
