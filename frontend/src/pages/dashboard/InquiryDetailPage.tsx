import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contactAPI } from '../../lib/api';
import type { ContactInquiry } from '../../lib/api';
import { Loader2 } from 'lucide-react';
import SEO from '../../components/SEO';

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    contactAPI.getById(id)
      .then((res) => setInquiry(res.data.data.contact))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
  if (error) return <div className="py-8 text-red-400">{error}</div>;
  if (!inquiry) return <div className="py-8 text-gray-400">Not found</div>;

  return (
    <div className="space-y-6">
      <SEO title={`Inquiry: ${inquiry.name}`} description={`Inquiry from ${inquiry.name} - ${inquiry.subject}`} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Inquiry Details</h1>
        <Link to="/admin/inquiries" className="text-sm text-gray-400 hover:text-white">← Back</Link>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-3xl">
        <p className="text-sm text-gray-400">Reference: <span className="text-gray-300">{inquiry.referenceId || '-'}</span></p>
        <h2 className="text-lg font-semibold text-white mt-2">{inquiry.name} &lt;{inquiry.email}&gt;</h2>
        <p className="text-sm text-gray-400 mt-1">Subject: {inquiry.subject}</p>
        <p className="mt-4 text-gray-200 whitespace-pre-wrap">{inquiry.message}</p>
        {inquiry.adminNotes && inquiry.adminNotes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-300">Admin notes</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {inquiry.adminNotes.map((n: any, idx: number) => (
                <li key={idx} className="bg-gray-900 p-2 rounded">{n.note} <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div></li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 text-xs text-gray-500">Received: {new Date(inquiry.createdAt).toLocaleString()}</div>
      </div>
    </div>
  );
}
