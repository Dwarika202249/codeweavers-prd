import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { enrollmentAPI } from '../../lib/api';
import SEO from '../../components/SEO';
import { Loader2, UploadCloud } from 'lucide-react';

export default function EnrollmentDetailsPage() {
  const { id } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    enrollmentAPI.getById(id)
      .then((res) => setEnrollment(res.data.data.enrollment))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('notes', notes);
      await enrollmentAPI.uploadAssignment(id, form);
      // refresh enrollment
      const updated = await enrollmentAPI.getById(id);
      setEnrollment(updated.data.data.enrollment);
      setFile(null);
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!enrollment) return <div className="text-gray-400">Enrollment not found</div>;

  const course = enrollment.course || {};

  return (
    <div className="space-y-6">
      <SEO title={`${course.title || 'Course'} | Enrollment Details`} description={`Enrollment details for ${course.title || ''}`} />
      <div className="flex items-start gap-4">
        {course.coverImage ? <img src={course.coverImage} alt={course.title} className="w-28 h-20 rounded object-cover" /> : <div className="w-28 h-20 rounded bg-gray-800" />}
        <div>
          <h1 className="text-xl font-bold text-white">{course.title}</h1>
          <div className="mt-1 text-sm text-gray-300">Instructor: {course.instructor || '—'}</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="px-2 py-1 rounded bg-indigo-700 text-sm text-white">{enrollment.status}</div>
            <div className="text-sm text-gray-400">Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}</div>
            <div className="text-sm text-gray-400">Payment: {enrollment.paymentStatus || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Progress</div>
            <div className="mt-2 flex items-center gap-3">
              <progress className="w-56 h-3 progress-bar" value={Math.max(0, Math.min(100, enrollment.progress || 0))} max={100} />
              <div className="text-sm text-gray-300">{enrollment.progress || 0}%</div>
            </div>
          </div>
          <div className="text-sm text-gray-400">Paid: {enrollment.pricePaid ? `₹${enrollment.pricePaid}` : '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded p-4">
          <h3 className="font-medium text-white">Curriculum</h3>
          <div className="mt-3 space-y-2">
            {(course.curriculum || []).map((m: any, i: number) => (
              <div key={i} className="p-3 rounded border border-gray-700 bg-gray-900">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{m.title || `Week ${m.week || i+1}`}</div>
                      <div className="text-sm text-gray-400 truncate">{(m.topics || []).join(', ')}</div>
                    </div>
                    <div className="text-sm text-gray-300 whitespace-nowrap shrink-0">{(enrollment.completedModules || []).includes(m.title || m.week || String(i)) ? 'Done' : 'Not started'}</div>
                  </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4">
          <h3 className="font-medium text-white">Assignments</h3>
          <div className="mt-3 space-y-3">
            {(enrollment.assignments || []).length === 0 ? <div className="text-gray-400">No submissions yet</div> : (
              (enrollment.assignments || []).map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-gray-900 border border-gray-700">
                  <div>
                    <div className="text-sm text-white">{a.title}</div>
                    <div className="text-xs text-gray-400">{a.filename} • {a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : ''}</div>
                  </div>
                  <a className="text-indigo-400 text-sm" href={a.fileUrl} target="_blank" rel="noreferrer">Download</a>
                </div>
              ))
            )}

            <form onSubmit={handleUpload} className="space-y-2">
              <label className="text-sm text-gray-300">Submit assignment</label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <label htmlFor="assignment-file" className="sr-only">Assignment file</label>
                  <input id="assignment-file" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="text-sm" />
                </div>
                <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded bg-gray-800 px-2 py-1 text-white w-full sm:flex-1 sm:min-w-0" />
                <div className="w-full sm:w-auto flex justify-end">
                  <button type="submit" disabled={uploading || !file} className="w-full sm:w-auto px-3 py-1 rounded bg-indigo-600 text-white flex items-center gap-2 whitespace-nowrap">{uploading ? 'Uploading...' : <>Upload <UploadCloud className="w-4 h-4" /></>}</button>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
