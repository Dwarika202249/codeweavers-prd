import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contactAPI } from '../../lib/api';
import type { ContactInquiry } from '../../lib/api';
import { Loader2, ArrowLeft, Mail, Clock, Clipboard, Download, CheckCircle, X } from 'lucide-react';
import SEO from '../../components/SEO';

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  // relative time helper (kept locally for resilience)
  const timeAgo = (input?: string | number | Date) => {
    if (!input) return ''; const then = new Date(input).getTime(); if (Number.isNaN(then)) return '';
    const diff = Date.now() - then; const seconds = Math.floor(diff / 1000);
    if (seconds < 10) return 'just now'; if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24); if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    const months = Math.floor(days / 30); if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    const years = Math.floor(months / 12); return `${years} year${years === 1 ? '' : 's'} ago`;
  };

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    contactAPI.getById(id)
      .then((res) => { if (!mounted) return; setInquiry(res.data.data.contact); })
      .catch((err) => setError(err.message || 'Failed to load inquiry'))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  const handleCopyEmail = async () => {
    if (!inquiry) return;
    try {
      await navigator.clipboard.writeText(inquiry.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // fallback
      alert('Copy to clipboard failed. Email: ' + inquiry.email);
    }
  };

  const handleExportJSON = () => {
    if (!inquiry) return;
    const blob = new Blob([JSON.stringify(inquiry, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inquiry-${inquiry._id}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const handleToggleStatus = async () => {
    if (!inquiry || !id) return;
    setUpdating(true);
    // backend expects one of ['new', 'in-progress', 'resolved', 'closed']
    // toggle between 'resolved' (mark resolved) and 'in-progress' (reopen)
    const isCurrentlyClosed = inquiry.status === 'closed' || inquiry.status === 'resolved';
    const newStatus = isCurrentlyClosed ? 'in-progress' : 'resolved';
    try {
      const res = await contactAPI.updateStatus(id, newStatus);
      setInquiry(res.data.data?.contact || { ...inquiry, status: newStatus });
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    } finally { setUpdating(false); }
  };

  if (loading) return <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
  if (error) return <div className="py-8 text-red-400">{error}</div>;
  if (!inquiry) return <div className="py-8 text-gray-400">Not found</div>;

  const isClosed = inquiry.status === 'closed' || inquiry.status === 'resolved';

  return (
    <div className="space-y-6">
      <SEO title={`Inquiry: ${inquiry.name}`} description={`Inquiry from ${inquiry.name} - ${inquiry.subject}`} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/inquiries" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Inquiries</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isClosed ? 'bg-green-800 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
            {isClosed ? 'Resolved' : 'Open'}
          </span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-semibold text-white">{inquiry.subject}</h1>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              <div className="font-medium text-white">{inquiry.name}</div>
              <a href={`mailto:${inquiry.email}?subject=${encodeURIComponent('Re: ' + inquiry.subject)}`} className="text-indigo-300 hover:text-indigo-200 text-sm">{inquiry.email}</a>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">{timeAgo(inquiry.createdAt)}</div>
                <div className="text-xs text-gray-500">{new Date(inquiry.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-900 p-4 rounded-lg border border-gray-800 text-gray-200 prose max-w-none whitespace-pre-wrap">
            {inquiry.message}
          </div>

          {inquiry.adminNotes && inquiry.adminNotes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-300">Admin notes</h3>
              <ul className="mt-2 space-y-2">
                {inquiry.adminNotes.map((n: any, idx: number) => (
                  <li key={idx} className="bg-gray-900 p-3 rounded border border-gray-800">
                    <div className="text-sm text-gray-200">{n.note}</div>
                    <div className="text-xs text-gray-500 mt-1">{n.addedBy ? `${n.addedBy} • ` : ''}{new Date(n.createdAt || Date.now()).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="md:col-span-1 space-y-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">Reference</div>
              <div className="text-sm text-gray-300">{inquiry.referenceId || '—'}</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-400">Status</div>
              <div className={`text-sm font-medium ${isClosed ? 'text-green-300' : 'text-yellow-300'}`}>{isClosed ? 'Resolved' : 'Open'}</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-400">Subject</div>
              <div className="text-sm text-gray-300">{inquiry.subject}</div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <a href={`mailto:${inquiry.email}?subject=${encodeURIComponent('Re: ' + inquiry.subject)}`} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm">
                <Mail className="w-4 h-4" /> Reply
              </a>
              <button onClick={handleCopyEmail} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm text-gray-300">
                <Clipboard className="w-4 h-4" /> {copied ? 'Copied' : 'Copy email'}
              </button>
              <button onClick={handleExportJSON} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm text-gray-300">
                <Download className="w-4 h-4" /> Export
              </button>
              <button onClick={handleToggleStatus} disabled={updating} className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded ${isClosed ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-green-700 hover:bg-green-600 text-white'} text-sm`}>
                {isClosed ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} {isClosed ? (updating ? 'Reopening...' : 'Reopen') : (updating ? 'Resolving...' : 'Mark as resolved')}
              </button>
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 text-sm text-gray-400">
            <div className="font-medium text-gray-200">Details</div>
            <div className="mt-2">
              <div className="flex justify-between"><span className="text-xs text-gray-400">Received</span><span className="text-xs">{timeAgo(inquiry.createdAt)}</span></div>
              <div className="flex justify-between mt-1"><span className="text-xs text-gray-400">Email</span><span className="text-xs text-indigo-300">{inquiry.email}</span></div>
              <div className="flex justify-between mt-1"><span className="text-xs text-gray-400">Subject</span><span className="text-xs text-gray-300">{inquiry.subject}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
