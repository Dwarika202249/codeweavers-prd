import { useEffect, useState } from 'react';
import { contactAPI } from '../../lib/api';
import type { ContactInquiry } from '../../lib/api';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState('Contact Inquiries');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in-progress' | 'resolved' | 'closed'>('all');

  useEffect(() => {
    setPageTitle(inquiries.length > 0 ? `${inquiries.length} Inquiries` : 'Contact Inquiries');
  }, [inquiries.length]);
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params: any = { page, limit: 20 };
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    contactAPI.getAll(params)
      .then((res) => {
        setInquiries(res.data.data.contacts);
        setTotalPages(res.data.data.pagination.pages);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch inquiries');
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  // Reset to first page when filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <SEO title={pageTitle} description={`Manage contact inquiries (${inquiries.length})`} />
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold text-white">Contact Inquiries</h1>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="statusFilter" className="text-sm text-gray-400">Status</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-gray-800 text-sm text-gray-300 rounded px-2 py-1 border border-gray-700"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in-progress">Open</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-gray-400">Subject</th>
                <th className="px-4 py-3 text-left text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-gray-400">Message</th>
                <th className="px-4 py-3 text-left text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-gray-400">View</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">No inquiries found.</td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-white font-medium">{inq.name}</td>
                    <td className="px-4 py-3 text-indigo-300">{inq.email}</td>
                    <td className="px-4 py-3 text-gray-300">{inq.subject}</td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        inq.status === 'resolved' || inq.status === 'closed' ? 'bg-green-800 text-green-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {(inq.status === 'resolved' || inq.status === 'closed') ? 'Resolved' : 'Open'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{inq.message}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(inq.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400">
                      <Link to={`/admin/inquiries/${inq._id}`} aria-label={`View inquiry ${inq.name}`} className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-indigo-600 hover:text-white disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-gray-400">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-indigo-600 hover:text-white disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
}