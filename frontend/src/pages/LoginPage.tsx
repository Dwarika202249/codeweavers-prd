import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, BarChart2, Shield, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SEO from '../components/SEO';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, googleLogin, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sessionExpired = searchParams.get('session_expired') === 'true';
  
  // Get the redirect path from location state (set by ProtectedRoute)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Helper to get redirect destination based on user role
  const getRedirectPath = useCallback(() => {
    // If there's a saved path (from ProtectedRoute), use it
    if (from && from !== '/') {
      return from;
    }
    // Otherwise redirect based on user role
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'college_admin') return '/college';
    return '/dashboard';
  }, [from, user?.role]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(getRedirectPath(), { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, getRedirectPath]);

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await login(data.email, data.password);
      // Navigation will happen via the useEffect above after auth state updates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Sign-In response
  const handleGoogleResponse = useCallback(async (response: google.accounts.id.CredentialResponse) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await googleLogin(response.credential);
      // Navigation will happen via the useEffect above after auth state updates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [googleLogin]);

  // Initialize Google Sign-In
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById('google-signin-button')!,
        { 
          theme: 'outline', 
          size: 'large', 
          width: '320',
          text: 'signin_with',
        }
      );
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [handleGoogleResponse]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Login"
        description="Sign in to your CodeWeavers account to access your courses and track your progress."
      />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-gray-900 via-gray-950 to-black">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          {/* Left - Marketing / details */}
          <motion.section initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="hidden md:block md:col-span-7 text-gray-100 relative overflow-hidden">
            {/* subtle grid background */}
            <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-10 z-0" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0 H0 V40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            <h1 className="text-6xl font-extrabold bg-clip-text text-white mb-5 bg-linear-to-r from-primary-300 to-accent-400">CodeWeavers</h1>
            <div className="text-lg text-primary-300 font-medium mt-2">Trust-first, cohort-based learning for Tier-2/3 cities</div>
            <p className="mt-4 text-lg text-gray-300 max-w-xl">A trust-first learning platform tailored to Tier-2/3 cities — cohort-led, mentor-backed, and outcome-driven.</p>

            <motion.ul initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} className="mt-8 space-y-4">
              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }} className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-700/20 text-primary-300"><Zap className="w-5 h-5" /></span>
                <div>
                  <div className="font-semibold">Hands-on Bootcamps</div>
                  <div className="text-sm text-gray-400">Project-first curriculum designed for jobs.</div>
                </div>
              </motion.li>

              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }} className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-700/20 text-primary-300"><BarChart2 className="w-5 h-5" /></span>
                <div>
                  <div className="font-semibold">Performance Analytics</div>
                  <div className="text-sm text-gray-400">Real-time progress tracking for learners and mentors.</div>
                </div>
              </motion.li>

              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }} className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-700/20 text-primary-300"><Star className="w-5 h-5" /></span>
                <div>
                  <div className="font-semibold">Placement Focus</div>
                  <div className="text-sm text-gray-400">Cohort-first support to maximise placement chances.</div>
                </div>
              </motion.li>

              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }} className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-700/20 text-primary-300"><Shield className="w-5 h-5" /></span>
                <div>
                  <div className="font-semibold">Secure & Private</div>
                  <div className="text-sm text-gray-400">Privacy and data protection built-in.</div>
                </div>
              </motion.li>
            </motion.ul>

          </motion.section>

          {/* Right - Auth card */}
          <motion.aside initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-5 bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/6 relative">
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/5 pointer-events-none" />
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-white/6 to-white/3 blur-3xl opacity-10 animate-pulse pointer-events-none" />
            <h1 className="text-3xl text-center font-extrabold bg-clip-text text-white mb-5 bg-linear-to-r from-primary-300 to-accent-400">CodeWeavers</h1>
            <h2 className="text-xl font-bold text-white">Welcome Back!</h2>
            <p className="text-sm text-gray-300 mt-1">Sign in to continue your learning journey.</p>

            {/* Session & error */}
            {sessionExpired && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg mt-4">Your session has expired. Please sign in again.</div>
            )}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mt-4">{error}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <label className="block text-sm text-gray-200">Email Address</label>
              <div>
                <input id="email" type="email" autoComplete="email" {...register('email')} className="mt-1 block w-full px-4 py-3 rounded-lg bg-white/5 border border-white/6 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <label className="block text-sm text-gray-200">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" {...register('password')} className="mt-1 block w-full px-4 py-3 pr-12 rounded-lg bg-white/5 border border-white/6 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-300 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300 flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-white/10 bg-white/5" /> Remember me</label>
                <Link to="/forgot" className="text-sm text-primary-300 hover:underline">Forgot password?</Link>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                initial={{ backgroundPosition: '0% 50%' }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(99,102,241,0.18)', backgroundPosition: '100% 50%' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative w-full py-3 rounded-lg bg-linear-to-r from-primary-500 to-accent-500 text-white font-medium shadow-lg overflow-hidden"
                style={{ backgroundSize: '200% 100%' }}
              >
                <motion.span
                  className="absolute inset-0 rounded-lg pointer-events-none bg-white/5"
                  initial={{ opacity: 0, x: -30 }}
                  whileHover={{ opacity: 0.06, x: 30 }}
                  transition={{ duration: 0.32 }}
                />

                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25 stroke-current" cx="12" cy="12" r="10" strokeWidth="4" />
                      <path className="opacity-75 fill-current" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="truncate">Signing in...</span>
                  </span>
                ) : (
                  'Sign In'
                )}
              </motion.button>

              <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/6" />
                </div>
                <div className="relative flex justify-center text-sm text-gray-300"><span className="px-2 bg-[#1f0436]">Or continue with</span></div>
              </div>

              <div id="google-signin-button" className="flex justify-center mt-4" />

              <p className="text-center text-sm text-gray-300 mt-6">Don't have an account? <Link to="/register" className="font-medium text-primary-300 hover:underline">Create one</Link></p>
              <p className="text-center text-sm text-gray-300 mt-2">Or <Link to="/colleges/signup" className="font-medium text-primary-300 hover:underline">Create College account</Link></p>
            </form>
          </motion.aside>
        </motion.div>
      </div>
    </>
  );
}
