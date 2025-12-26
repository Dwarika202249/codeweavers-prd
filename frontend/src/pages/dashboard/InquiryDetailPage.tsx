import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contactAPI } from '../../lib/api';
import type { ContactInquiry } from '../../lib/api';
import { Loader2 } from 'lucide-react';
import { showSuccess, showError } from '../../lib/toastUtils';

const STATUS_OPTIONS = ['new', 'in-progress', 'resolved', 'closed'];

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    contactAPI.getById(id)
      .then((res) => {
        setInquiry(res.data.data.contact);
        setStatus(res.data.data.contact.status || 'new');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await contactAPI.updateStatus(id, status);
      const res = await contactAPI.getById(id);
      setInquiry(res.data.data.contact);
      showSuccess('Status updated');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!id || !note.trim()) return;
    setSaving(true);
    try {
      await contactAPI.addNote(id, note.trim());
      setNote('');
      const res = await contactAPI.getById(id);
      setInquiry(res.data.data.contact);
      showSuccess('Note added');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this inquiry?')) return;
    try {
      await contactAPI.remove(id);
      showSuccess('Inquiry deleted');
      navigate('/admin/inquiries');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) return <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
  if (error) return <div className="py-8 text-red-400">{error}</div>;
  if (!inquiry) return <div className="py-8 text-gray-400">Not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Inquiry Details</h1>
        <div className="flex items-center gap-2">
          <Link to="/admin/inquiries" className="text-sm text-gray-400 hover:text-white">← Back</Link>
          <button aria-label="Delete inquiry" onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="text-sm text-gray-400">Reference: <span className="text-gray-300">{inquiry.referenceId}</span></p>
        <h2 className="text-lg font-semibold text-white mt-2">{inquiry.name} &lt;{inquiry.email}&gt;</h2>
        <p className="text-sm text-gray-400 mt-1">Subject: {inquiry.subject}</p>
        <p className="mt-4 text-gray-200 whitespace-pre-wrap">{inquiry.message}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 id="status-label" className="text-sm text-gray-300">Status</h3>
          <div className="mt-2 flex items-center gap-2">
            <select id="status-select" aria-labelledby="status-label" title="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded bg-gray-900 px-3 py-2 text-gray-100">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button disabled={saving} onClick={handleStatusUpdate} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">Save</button>
          </div>
          <div className="mt-3 text-sm text-gray-400">Current: <span className="text-gray-200">{inquiry.status}</span></div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="text-sm text-gray-300">Admin Notes</h3>
          <div className="mt-2">
            {inquiry.adminNotes && inquiry.adminNotes.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {inquiry.adminNotes.map((n: any, idx: number) => (
                  <li key={idx} className="bg-gray-900 p-2 rounded">{n.note} <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div></li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No notes yet.</div>
            )}
          </div>

          <div className="mt-3">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded bg-gray-900 px-3 py-2 text-gray-100" rows={3} placeholder="Add a note..." />
            <div className="mt-2 flex gap-2">
              <button disabled={saving} onClick={handleAddNote} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">Add Note</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
