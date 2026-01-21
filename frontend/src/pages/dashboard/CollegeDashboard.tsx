import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SEO from '../../components/SEO';

export default function CollegeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only college_admin or tpo can access this page
    if (!user) return;
    if (!['college_admin', 'tpo'].includes(user.role)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Demo data (replace with real API calls later)
  const stats = {
    students: 124,
    activeInLast30Days: 98,
    placementReady: 32,
    topPerformers: [
      { name: 'Asha K.', score: 95 },
      { name: 'Ravi S.', score: 92 },
      { name: 'Nisha P.', score: 90 },
    ],
  };

  return (
    <div>
      <SEO title="College Dashboard" description={`Overview for ${user?.name || 'College Admin'}`} />
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">College Dashboard</h1>
          <div className="text-sm text-gray-400">Welcome, {user?.name}</div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-900 rounded border border-gray-800">
            <div className="text-sm text-gray-400">Students</div>
            <div className="text-2xl font-bold">{stats.students}</div>
          </div>

          <div className="p-4 bg-gray-900 rounded border border-gray-800">
            <div className="text-sm text-gray-400">Active (30d)</div>
            <div className="text-2xl font-bold">{stats.activeInLast30Days}</div>
          </div>

          <div className="p-4 bg-gray-900 rounded border border-gray-800">
            <div className="text-sm text-gray-400">Placement Ready</div>
            <div className="text-2xl font-bold">{stats.placementReady}</div>
          </div>

          <div className="p-4 bg-gray-900 rounded border border-gray-800">
            <div className="text-sm text-gray-400">Top Performer</div>
            <div className="text-lg font-medium">{stats.topPerformers[0].name} • {stats.topPerformers[0].score}%</div>
          </div>
        </div>

        <section className="bg-gray-900 p-4 rounded border border-gray-800">
          <h2 className="text-lg font-semibold mb-3">Top performers</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            {stats.topPerformers.map((t) => (
              <li key={t.name} className="flex items-center justify-between">
                <span>{t.name}</span>
                <span className="font-medium">{t.score}%</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-gray-900 p-4 rounded border border-gray-800">
          <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/colleges')} className="px-3 py-2 rounded bg-indigo-600 text-white">Manage College</button>
            <button onClick={() => navigate('/admin/colleges')} className="px-3 py-2 rounded bg-green-600 text-white">Create Invite</button>
            <button onClick={() => alert('Export reports (demo)')} className="px-3 py-2 rounded bg-gray-700 text-white">Export CSV</button>
          </div>
        </section>
      </div>
    </div>
  );
}
