import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { enrollmentAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { showSuccess, showError } from '../lib/toastUtils';

export default function EnrollCTA({ courseSlug }: { courseSlug: string }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      // Redirect to login with redirect back to this page
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    setLoading(true);
    try {
      await enrollmentAPI.enroll({ courseSlug });
      showSuccess('Enrolled successfully');
      // navigate to student courses
      navigate('/dashboard/courses');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={handleEnroll} disabled={loading} className="mt-6 inline-block rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
          {loading ? 'Enrolling...' : 'Enroll Now'}
        </button>
      ) : (
        <Link to="/login" state={{ from: { pathname: window.location.pathname } }} className="mt-6 inline-block rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
          Sign in to Enroll
        </Link>
      )}
    </div>
  );
}
