import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { enrollmentAPI } from '../../lib/api';
import SEO from '../../components/SEO';
import { Loader2, CreditCard, PlusCircle, BookOpen } from 'lucide-react';
import { showError, showSuccess } from '../../lib/toastUtils';

export default function AdminEnrollmentDetailPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');

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
      default: return 'bg-gray-700 text-white';
    }
  };

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

      <div className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg p-5 border border-gray-700">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {enrollment.user?.avatar ? (
              <img src={enrollment.user.avatar} alt={enrollment.user?.name || 'Student avatar'} className="w-14 h-14 rounded-full object-cover shadow" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow">
                {(enrollment.user?.name || 'U').split(' ').map((s: string) => s[0]).slice(0,2).join('')}
              </div>
            )}
            <div>
              <div className="text-sm text-gray-400">Student</div>
              <div className="font-semibold text-white">{enrollment.user?.name}</div>
              <div className="text-xs text-gray-400">{enrollment.user?.email}</div>
              <div className="mt-2">
                <Link to={`/bootcamps/${enrollment.course?.slug}?adminView=true`} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-indigo-700 text-xs text-white">
                  <BookOpen className="w-3 h-3" /> {enrollment.course?.title}
                </Link>
              </div>
            </div>
          </div>

          <div className="md:ml-auto ml-0 flex items-start md:items-end gap-2 mt-3 md:mt-0">
            <div className="flex items-center gap-2">
              <span className={`${statusClass(enrollment.status)} px-3 py-1 rounded-full text-xs font-medium capitalize`}>{enrollment.status}</span>
              <span className={`${paymentClass(enrollment.paymentStatus)} px-3 py-1 rounded-full text-xs font-medium`}>{enrollment.paymentStatus || 'N/A'}</span>
            </div>

            <div className="flex gap-2 flex-wrap mt-2">
              <Link to={`/bootcamps/${enrollment.course?.slug}`} className="px-3 py-1 rounded bg-yellow-500 text-black text-sm">View Course</Link>
              <button className="px-3 py-1 rounded bg-gray-700 text-white text-sm" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Jump to Notes</button>
            </div>

            <div className="mt-2 text-sm text-gray-300">Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="text-sm text-gray-400">Progress</div>
            <div className="mt-2">
              <div>
                <progress
                  className="admin-enrollment-progress w-full rounded h-3"
                  value={Math.max(0, Math.min(100, enrollment.progress || 0))}
                  max={100}
                />
              </div>
              <div className="text-sm mt-1 text-gray-300">{enrollment.progress || 0}% complete</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400">Payment Status</div>
            <div className="mt-2">
              <div className="inline-flex items-center gap-2"><CreditCard className="w-4 h-4 text-gray-300" /><span className="font-medium text-white">{enrollment.paymentStatus || 'N/A'}</span></div>
              <div className="mt-2 text-indigo-300 font-semibold">{enrollment.pricePaid ? `₹${enrollment.pricePaid}` : '—'}</div>
            </div>
          </div>
        </div>

      </div>

      <div id="admin-notes" className="bg-gray-800 rounded p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Admin Notes</h3>
          <div className="text-xs text-gray-400">{(enrollment.adminNotes || []).length} notes</div>
        </div>

        <div className="mt-3 space-y-3">
          {(enrollment.adminNotes || []).length === 0 ? <div className="text-gray-400">No notes yet</div> : (
            (enrollment.adminNotes || []).map((n: any, i: number) => (
              <div key={i} className="p-3 rounded bg-gray-900 border-l-4 border-indigo-600">
                <div className="text-sm text-gray-300">{n.note}</div>
                <div className="text-xs text-gray-500 mt-1">By: {n.addedBy?.name || '—'} · {new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}

          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add internal note" className="rounded bg-gray-900 px-3 py-2 text-white w-full" />
            </div>
            <button onClick={addNote} disabled={!note.trim()} className="px-3 py-2 rounded bg-indigo-600 text-white flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Add</button>
          </div>
        </div>
      </div>

    </div>
  );
}
