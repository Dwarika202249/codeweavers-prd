import { useEffect, useState } from 'react';
import { adminCertificatesAPI } from '../../lib/api';
import SEO from '../../components/SEO';
import { Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showError } from '../../lib/toastUtils';

export default function AdminCertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const statusClass = (s?: string) => {
    switch ((s || '').toLowerCase()) {
      case 'issued': return 'bg-green-600 text-green-50';
      case 'rejected': return 'bg-red-600 text-red-50';
      case 'requested': return 'bg-yellow-600 text-yellow-900';
      case 'revoked': return 'bg-gray-600 text-white';
      default: return 'bg-gray-700 text-white';
    }
  }; 

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
          <div key={c._id} className="bg-linear-to-r from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {c.student?.avatar ? (
                <img src={c.student.avatar} alt={c.student?.name || 'User avatar'} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">{(c.student?.name || 'U').split(' ').map((s: string) => s[0]).slice(0,2).join('')}</div>
              )}
              <div>
                <div className="font-semibold text-white">{c.student?.name}</div>
                <div className="text-xs text-gray-400">{c.student?.email}</div>
                <div className="text-xs text-gray-400 mt-1">Course: <span className="text-indigo-300">{c.enrollment?.course?.title}</span></div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(c.requestAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`${statusClass(c.status)} px-3 py-1 rounded-full text-xs font-medium`}>{c.status}</span>
              <Link to={`/admin/certificates/${c._id}`} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">View</Link>
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
