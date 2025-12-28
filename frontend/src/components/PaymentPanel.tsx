import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { enrollmentAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { showSuccess, showError } from '../lib/toastUtils';

export default function PaymentPanel({ courseSlug, price = 0, coverImage, shortDescription }: { courseSlug: string; price?: number; coverImage?: string; shortDescription?: string }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    // On mount, check if authenticated user already has an enrollment for this course
    let mounted = true;
    const check = async () => {
      if (!isAuthenticated) return;
      setChecking(true);
      try {
        const res = await enrollmentAPI.getMy();
        const enrollments = res.data?.data?.enrollments || [];
        const found = enrollments.some((e: any) => e.course?.slug === courseSlug || e.courseSlug === courseSlug || e.courseId === courseSlug);
        if (mounted) setIsEnrolled(!!found);
      } catch (err) {
        // ignore errors but log
        console.warn('Failed to fetch enrollments', err);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    check();
    return () => { mounted = false; };
  }, [isAuthenticated, courseSlug]);
  const handleStart = () => {
    // If not authenticated, redirect to login so enrollment can be associated with user
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    setShowModal(true);
  };

  const handleMockPay = async () => {
    setPaying(true);
    // Simulate a short payment delay
    try {
      await new Promise((r) => setTimeout(r, 1200));
      // Simulate payment success and call enroll API
      await enrollmentAPI.enroll({ courseSlug });
      showSuccess('Payment successful — you are enrolled!');
      setIsEnrolled(true);
      setShowModal(false);
      navigate('/dashboard/courses');
    } catch (err) {
      // If server says already enrolled, reflect that
      const msg = err instanceof Error ? err.message : 'Payment / Enrollment failed';
      showError(msg);
      if (String(msg).toLowerCase().includes('already')) {
        setIsEnrolled(true);
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="w-full">
      <div className="sticky top-6 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
        {coverImage ? (
          <img src={coverImage} alt="course cover" className="mb-4 h-40 w-full rounded object-cover" />
        ) : (
          <div className="mb-4 h-40 w-full rounded bg-gray-800/50 flex items-center justify-center text-gray-400">No image</div>
        )}
        <div className="text-sm text-gray-400">Price</div>
        <div className="mt-1 text-3xl font-bold text-white">{price ? `₹${price}` : 'Free'}</div>
        {/* Short description from DB shown under the price */}
        {shortDescription && (
          <div className="mt-2 text-sm text-gray-300">{shortDescription}</div>
        )}
        <div className="mt-4 text-sm text-gray-300">Secure payment via Razorpay (mock)</div>
        {/* Enroll button variations */}
        {checking ? (
          <div className="mt-6 text-sm text-gray-400">Checking enrollment…</div>
        ) : isEnrolled ? (
          <div className="mt-6 flex flex-col gap-2">
            <button disabled className="w-full rounded bg-green-600 px-4 py-2 font-semibold text-white">Enrolled</button>
            <Link to="/dashboard/courses" className="w-full text-center rounded border border-gray-700 px-3 py-2 text-sm text-gray-200">View my courses</Link>
          </div>
        ) : (
          <button onClick={handleStart} className="mt-6 w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500">Enroll Now</button>
        )}
      </div>

      {/* Mock payment modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded bg-gray-900 p-6">
            <h3 className="text-lg font-semibold text-white">Mock Razorpay Checkout</h3>
            <p className="mt-2 text-sm text-gray-300">This is a simulated payment flow for demo purposes.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={handleMockPay} disabled={paying} className="inline-flex items-center justify-center rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-500">
                {paying ? 'Processing…' : 'Pay now (mock)'}
              </button>
              <button onClick={() => setShowModal(false)} className="inline-flex items-center justify-center rounded bg-gray-800 px-4 py-2 font-medium text-gray-200 hover:bg-gray-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
