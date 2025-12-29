import { useEffect, useState } from 'react';
import { enrollmentAPI } from '../../lib/api';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { Loader2 } from 'lucide-react';
import { showError, showSuccess } from '../../lib/toastUtils';

export default function AdminEnrollmentsPage() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await enrollmentAPI.getAll({ page, limit } as any);
      setEnrollments(res.data.data.enrollments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [page]);

  const changeStatus = async (id: string, status: string) => {
    try {
      await enrollmentAPI.update(id, { status });
      showSuccess('Status updated');
      fetch();
    } catch (err: any) {
      showError(err.message || 'Failed to update');
    }
  };

  const markRefunded = async (id: string) => {
    try {
      await enrollmentAPI.update(id, { paymentStatus: 'refunded' });
      showSuccess('Marked refunded');
      fetch();
    } catch (err: any) {
      showError(err.message || 'Failed to mark refunded');
    }
  };

  if (loading) return <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;

  return (
    <div className="space-y-6">
      <SEO title="Enrollments" description="Manage student enrollments" />
      <h1 className="text-xl font-bold text-white">Enrollments</h1>
      {error && <div className="text-red-400">{error}</div>}

      <div className="flex items-center gap-3">
        <label htmlFor="status-filter" className="sr-only">Status filter</label>
        <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded bg-gray-800 px-2 py-1 text-white">
          <option value="">All statuses</option>
          <option value="enrolled">enrolled</option>
          <option value="pending">pending</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
        <button onClick={fetch} className="px-3 py-1 rounded bg-indigo-600 text-white">Refresh</button>
      </div>

      <div className="mt-4 space-y-3">
        {enrollments.filter(e => !statusFilter || e.status === statusFilter).map((e) => (
          <div key={e._id} className="bg-gray-800 rounded p-3 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{e.user?.name} — <span className="text-gray-400">{e.user?.email}</span></div>
                <div className="text-sm text-gray-400">Course: {e.course?.title}</div>
                <div className="text-sm text-gray-400">Enrolled: {new Date(e.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor={`status-${e._id}`} className="sr-only">Change status</label>
                <select id={`status-${e._id}`} value={e.status} onChange={(ev) => changeStatus(e._id, ev.target.value)} className="rounded bg-gray-700 px-2 py-1 text-white text-sm">
                  <option value="enrolled">enrolled</option>
                  <option value="pending">pending</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
                <button onClick={() => markRefunded(e._id)} className="px-2 py-1 rounded bg-red-600 text-white text-sm">Mark refunded</button>
                <Link to={`/admin/enrollments/${e._id}`} className="px-2 py-1 rounded bg-gray-700 text-white text-sm">View</Link>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">Page {page}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-700 text-white">Prev</button>
            <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded bg-gray-700 text-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
