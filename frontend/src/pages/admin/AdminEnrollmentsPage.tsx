import { useEffect, useState } from 'react';
import { enrollmentAPI } from '../../lib/api';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { Loader2, CreditCard } from 'lucide-react';
import { showError, showSuccess } from '../../lib/toastUtils';

export default function AdminEnrollmentsPage() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const statusClass = (s?: string) => {
    switch ((s || '').toLowerCase()) {
      case 'enrolled': return 'bg-emerald-600 text-emerald-50';
      case 'pending': return 'bg-yellow-600 text-yellow-900';
      case 'completed': return 'bg-indigo-600 text-indigo-50';
      case 'cancelled': return 'bg-red-600 text-red-50';
      default: return 'bg-gray-700 text-gray-100';
    }
  };

  const paymentClass = (p?: string) => {
    switch ((p || '').toLowerCase()) {
      case 'paid': return 'bg-green-600 text-white';
      case 'pending': return 'bg-yellow-600 text-black';
      case 'refunded': return 'bg-red-600 text-white';
      default: return 'bg-gray-700 text-white';
    }
  };

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
          <div key={e._id} className="bg-linear-to-r from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">{(e.user?.name || 'U').split(' ').map((s: string) => s[0]).slice(0,2).join('')}</div>

              <div>
                <div className="font-semibold text-white">{e.user?.name}</div>
                <div className="text-xs text-gray-400">{e.user?.email}</div>
                <div className="text-xs text-gray-400 mt-1">Course: <span className="text-indigo-300">{e.course?.title}</span></div>
                <div className="text-xs text-gray-500">Enrolled: {new Date(e.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-2 mr-2">
                <span className={`${statusClass(e.status)} px-3 py-1 rounded-full text-xs font-medium`}>{e.status}</span>
                <span className={`${paymentClass(e.paymentStatus)} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2`}><CreditCard className="w-3 h-3" /> {e.paymentStatus || 'N/A'}</span>
              </div>

              <div className="flex gap-2">
                <select aria-label={`Change status for ${e.user?.name}`} id={`status-${e._id}`} value={e.status} onChange={(ev) => changeStatus(e._id, ev.target.value)} className="rounded bg-gray-900 border border-gray-800 px-2 py-1 text-white text-sm">
                  <option value="enrolled">enrolled</option>
                  <option value="pending">pending</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
                <button onClick={() => markRefunded(e._id)} className="px-2 py-1 rounded bg-red-600 text-white text-sm">Refund</button>
                <Link to={`/admin/enrollments/${e._id}`} className="px-2 py-1 rounded bg-indigo-600 text-white text-sm">View</Link>
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
