import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import { adminAssignmentsAPI, adminSubmissionsAPI } from '../../lib/api';
import { showError, showSuccess } from '../../lib/toastUtils';

export default function AdminAssignmentDetailPage() {
  const { id } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  const fetch = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminAssignmentsAPI.getById(id);
      setAssignment(res.data.data.assignment);
      const subs = await adminSubmissionsAPI.getByAssignment(id, { limit: 200 });
      setSubmissions(subs.data.data.submissions || []);
    } catch (err: any) {
      showError(err?.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [id]);

  const handleGrade = async (submissionId: string, score?: number, status?: 'graded'|'rejected') => {
    try {
      await adminSubmissionsAPI.grade(submissionId, { score, feedback: notes, status: status || 'graded' });
      showSuccess('Submission updated');
      setNotes('');
      fetch();
    } catch (err: any) {
      showError(err?.message || 'Failed');
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-400">Loading…</div>;
  if (!assignment) return <div className="text-gray-400">Assignment not found</div>;

  return (
    <div className="space-y-6">
      <SEO title={`Assignment ${assignment.title}`} description={`Assignment detail`} />
      <div className="bg-gray-800 rounded p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-white">{assignment.title}</div>
            <div className="text-sm text-gray-400">{assignment.description}</div>
          </div>
          <div className="text-sm text-gray-400">Submissions: {submissions.length}</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded p-4">
        <h3 className="font-medium text-white">Submissions</h3>
        <div className="mt-3 space-y-2">
          {submissions.length === 0 ? <div className="text-gray-400">No submissions yet</div> : submissions.map((s) => (
            <div key={s._id} className="rounded p-3 bg-gray-900 border border-gray-800">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-sm text-white">{s.student?.name} <span className="text-xs text-gray-400">{s.student?.email}</span></div>
                  <div className="text-xs text-gray-400">Link: <a className="text-indigo-400 hover:underline" href={s.link} target="_blank" rel="noreferrer">{s.link}</a></div>
                  <div className="text-xs text-gray-400">Notes: {s.notes}</div>
                </div>
                <div className="text-xs text-gray-400">Status: <span className={`${s.status === 'graded' ? 'text-green-300' : s.status === 'rejected' ? 'text-red-400' : 'text-yellow-300'}`}>{s.status}</span></div>
              </div>

              <div className="mt-3 flex gap-2 items-center">
                <input placeholder="Score" type="number" className="w-24 rounded bg-gray-800 px-2 py-1 text-white text-sm" id={`score-${s._id}`} />
                <input placeholder="Feedback" value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded bg-gray-800 px-2 py-1 text-white text-sm" />
                <button onClick={async () => {
                  const val = (document.getElementById(`score-${s._id}`) as HTMLInputElement)?.value;
                  await handleGrade(s._id, val ? Number(val) : undefined, 'graded');
                }} className="px-3 py-1 rounded bg-green-600 text-black text-sm">Grade</button>
                <button onClick={async () => { await handleGrade(s._id, undefined, 'rejected'); }} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Reject</button>
              </div>

              {s.feedback && <div className="mt-2 text-xs text-gray-400">Last feedback: {s.feedback}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}