import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { enrollmentAPI } from '../../lib/api';
import SEO from '../../components/SEO';
import { Loader2 } from 'lucide-react';
import { showError, showSuccess } from '../../lib/toastUtils';

export default function AdminEnrollmentDetailPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const fetch = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await enrollmentAPI.getById(id);
      setEnrollment(res.data.data.enrollment);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  const addNote = async () => {
    if (!id || !note.trim()) return;
    try {
      const res = await enrollmentAPI.addNote(id, note.trim());
      setEnrollment(res.data.data.enrollment);
      setNote('');
      showSuccess('Note added');
    } catch (err: any) {
      showError(err.message || 'Failed to add note');
    }
  };

  const updateEnrollment = async (payload: any) => {
    if (!id) return;
    try {
      const res = await enrollmentAPI.update(id, payload);
      setEnrollment(res.data.data.enrollment);
      showSuccess('Saved');
    } catch (err: any) {
      showError(err.message || 'Failed to save');
    }
  };

  if (loading) return <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!enrollment) return <div className="text-gray-400">Enrollment not found</div>;

  return (
    <div className="space-y-6">
      <SEO title={`Enrollment ${enrollment._id}`} description={`Enrollment details`} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Enrollment</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-gray-700 text-white" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>

      <div className="bg-gray-800 rounded p-4">
        <div className="flex items-start gap-4">
          <div>
            <div className="text-sm text-gray-400">Student</div>
            <div className="font-medium text-white">{enrollment.user?.name} • {enrollment.user?.email}</div>
            <div className="text-sm text-gray-400">Course: <Link to={`/bootcamps/${enrollment.course?.slug}`} className="text-indigo-400">{enrollment.course?.title}</Link></div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm text-gray-400">Status</div>
            <label htmlFor="admin-enrollment-status" className="sr-only">Change enrollment status</label>
            <select id="admin-enrollment-status" value={enrollment.status} onChange={(e) => updateEnrollment({ status: e.target.value })} className="rounded bg-gray-700 px-2 py-1 text-white">
              <option value="enrolled">enrolled</option>
              <option value="pending">pending</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="text-sm text-gray-400">Progress</div>
            <div className="mt-2 flex items-center gap-3">
              <progress className="w-full h-3 progress-bar" value={Math.max(0, Math.min(100, enrollment.progress || 0))} max={100} />
              <div className="text-sm text-gray-300">{enrollment.progress || 0}%</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400">Payment Status</div>
            <div className="font-medium text-white">{enrollment.paymentStatus || 'N/A'}</div>
            <div className="text-sm text-gray-400">Paid: {enrollment.pricePaid ? `₹${enrollment.pricePaid}` : '—'}</div>
          </div>
        </div>

      </div>

      <div className="bg-gray-800 rounded p-4">
        <h3 className="font-medium text-white">Admin Notes</h3>
        <div className="mt-3 space-y-2">
          {(enrollment.adminNotes || []).length === 0 ? <div className="text-gray-400">No notes yet</div> : (
            (enrollment.adminNotes || []).map((n: any, i: number) => (
              <div key={i} className="p-2 rounded bg-gray-900 border border-gray-700">
                <div className="text-sm text-gray-300">{n.note}</div>
                <div className="text-xs text-gray-500">By: {n.addedBy?.name || '—'} · {new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}

          <div className="mt-2 flex gap-2">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add internal note" className="rounded bg-gray-800 px-2 py-1 text-white flex-1" />
            <button onClick={addNote} disabled={!note.trim()} className="px-3 py-1 rounded bg-indigo-600 text-white">Add</button>
          </div>
        </div>
      </div>

    </div>
  );
}
