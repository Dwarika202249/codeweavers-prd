import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { enrollmentAPI } from '../../lib/api';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import SEO from '../../components/SEO';
import React from 'react';
const CertificatesList = React.lazy(() => import('../../components/CertificatesList'));

export default function ProfilePage() {
  const { user } = useAuth();
  const [pageTitle, setPageTitle] = useState('Profile');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) setPageTitle(user.name ? `${user.name.split(' ')[0]}'s Profile` : 'Profile');
  }, [user]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    enrollmentAPI.getMy()
      .then((res) => { if (!mounted) return; setEnrollments(res.data.data.enrollments || []); })
      .catch(() => { if (!mounted) return; setEnrollments([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const enrolledCount = enrollments.length;
  const completedCount = enrollments.filter((e) => e.status === 'completed' || (typeof e.progress !== 'undefined' && e.progress >= 100)).length;
  const avgProgress = enrollments.length === 0 ? 0 : Math.round(enrollments.reduce((s, e) => s + (Number(e.progress) || 0), 0) / enrollments.length);

  return (
    <div className="space-y-6">
      <SEO title={pageTitle} description="Profile and learning summary" />

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col md:flex-row items-center gap-6">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400 text-3xl font-semibold">{user?.name?.charAt(0) ?? 'U'}</div>
          )}
        </div>
        <div className="flex-1 min-w-0 text-center md:text-left">
          <h1 className="text-2xl font-semibold text-white">{user?.name}</h1>
          <div className="text-sm text-gray-400 mt-1">{user?.email}</div>
          <div className="mt-3 flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-300 text-sm">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-300 text-sm">{user?.role === 'admin' ? 'Admin' : 'Student'}</span>
          </div>
        </div>
        <div className="w-full md:w-auto flex gap-3 justify-center md:justify-end items-center md:flex-nowrap flex-wrap">
          <div className="bg-gray-900 p-3 rounded-lg text-center min-w-24 flex-1 md:flex-none">
            <div className="text-sm text-gray-400">Enrolled</div>
            <div className="text-lg font-semibold text-white">{enrolledCount}</div>
            <div className="text-xs text-gray-500 mt-1">Courses</div>
          </div>
          <div className="bg-gray-900 p-3 rounded-lg text-center min-w-24 flex-1 md:flex-none">
            <div className="text-sm text-gray-400">Progress</div>
            <div className="text-lg font-semibold text-white">{avgProgress}%</div>
            <div className="text-xs text-gray-500 mt-1">Avg completion</div>
          </div>
          <div className="bg-gray-900 p-3 rounded-lg text-center min-w-24 flex-1 md:flex-none">
            <div className="text-sm text-gray-400">Certificates</div>
            <div className="text-lg font-semibold text-white">{completedCount}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Courses</h2>
          <Link to="/dashboard/courses" className="text-sm text-indigo-400 hover:text-indigo-300">View all</Link>
        </div>

        {loading ? (
          <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : enrollments.length === 0 ? (
          <div className="py-8 text-center text-gray-400">You are not enrolled in any courses yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {enrollments.slice(0,4).map((e:any) => (
              <div key={e._id} className="flex items-center gap-4 bg-gray-900 p-3 rounded-lg border border-gray-800">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{e.course?.title || 'Course'}</div>
                  <div className="text-xs text-gray-400 truncate">{e.course?.shortDescription}</div>
                </div>
                <div className="w-48">
                  <div>
                    <progress value={Math.min(100, Math.max(0, Number(e.progress) || 0))} max={100} className="w-full h-2 rounded appearance-none" />
                    <div className="text-xs text-gray-400 mt-2 flex items-center justify-between">
                      <span>{e.status?.charAt(0)?.toUpperCase() + (e.status?.slice(1) || '')}</span>
                      <Link to={`/dashboard/courses/${e._id}`} className="text-xs text-indigo-400 hover:text-indigo-300">Continue</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Certificates list */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-white">Certificates</h3>
              <div className="mt-3">
                <div className="rounded border border-gray-700 bg-gray-900 p-3">
                  <p className="text-xs text-gray-400">Your issued certificates and requests</p>
                  <div className="mt-2">
                    {/* lazy loaded certificates list component */}
                    <React.Suspense fallback={<div className="text-gray-400">Loading certificates…</div>}>
                      <CertificatesList />
                    </React.Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
        <p className="text-gray-400">Want to update account details like name or password? Go to <Link to="/dashboard/settings" className="text-indigo-400">Settings</Link>.</p>
      </div>
    </div>
  );
}
