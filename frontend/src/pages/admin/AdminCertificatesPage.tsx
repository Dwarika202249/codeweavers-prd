import { useEffect, useState } from 'react';
import { adminCertificatesAPI } from '../../lib/api';
import SEO from '../../components/SEO';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showError } from '../../lib/toastUtils';

export default function AdminCertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminCertificatesAPI.getAll({ page, limit, status: statusFilter });
      setCertificates(res.data.data.certificates || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load certificates';
      setError(msg);
      showError(msg);
      console.error('AdminCertificates fetch error', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [page, statusFilter]);

  if (loading) return <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;

  return (
    <div className="space-y-6">
      <SEO title="Certificates" description="Manage certificate requests" />
      <h1 className="text-xl font-bold text-white">Certificates</h1>
      {error && <div className="text-red-400">{error}</div>}

      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="status-filter" className="sr-only">Status filter</label>
        <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded bg-gray-800 px-2 py-1 text-white">
          <option value="">All statuses</option>
          <option value="requested">requested</option>
          <option value="issued">issued</option>
          <option value="rejected">rejected</option>
          <option value="revoked">revoked</option>
        </select>
        <button onClick={fetch} className="px-3 py-1 rounded bg-indigo-600 text-white">Refresh</button>
      </div>

      <div className="space-y-3">
        {certificates.map((c) => (
          <div key={c._id} className="bg-gray-800 rounded p-3 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{c.student?.name} — <span className="text-gray-400">{c.student?.email}</span></div>
                <div className="text-sm text-gray-400">Course: {c.enrollment?.course?.title}</div>
                <div className="text-sm text-gray-400">Requested: {new Date(c.requestAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-sm ${c.status === 'issued' ? 'text-green-300' : c.status === 'rejected' ? 'text-red-400' : 'text-yellow-300'}`}>{c.status}</div>
                <Link to={`/admin/certificates/${c._id}`} className="px-2 py-1 rounded bg-gray-700 text-white text-sm">View</Link>
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
