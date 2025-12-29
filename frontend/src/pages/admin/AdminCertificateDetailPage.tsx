import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminCertificatesAPI, downloadAPI } from '../../lib/api';
import SEO from '../../components/SEO';
import { Loader2, User, FileText, CheckCircle } from 'lucide-react';
import { showError, showSuccess } from '../../lib/toastUtils';

export default function AdminCertificateDetailPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePreview = async () => {
    if (!id || !certificate) return;
    setDownloading(true);
    try {
      const res = await downloadAPI.certificate(certificate._id);
      const blob = new Blob([res.data], { type: (res.headers && res.headers['content-type']) || 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (err: any) {
      const msg = err?.message || 'Preview failed';
      showError(msg);
      console.error('Preview error', err);
    } finally {
      setDownloading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewOpen(false);
  };

  const statusClass = (s?: string) => {
    switch ((s || '').toLowerCase()) {
      case 'issued': return 'bg-green-600 text-green-50';
      case 'rejected': return 'bg-red-600 text-red-50';
      case 'requested': return 'bg-yellow-600 text-yellow-900';
      default: return 'bg-gray-700 text-white';
    }
  };

  const handleDownload = async (id: string, filename?: string) => {
    setDownloading(true);
    try {
      const res = await downloadAPI.certificate(id);
      const blob = new Blob([res.data], { type: (res.headers && res.headers['content-type']) || 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename ? `${filename.replace(/\s+/g, '_')}-certificate.pdf` : 'certificate.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      showError(err?.message || 'Download failed');
      console.error('Download certificate error', err);
    } finally {
      setDownloading(false);
    }
  }; 

  const fetch = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminCertificatesAPI.getById(id);
      setCertificate(res.data.data.certificate);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load';
      showError(msg);
      console.error('AdminCertificateDetail fetch error', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('notes', notes);
      const res = await adminCertificatesAPI.issueUpload(id, form);
      setCertificate(res.data.data.certificate);
      showSuccess('Certificate issued');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Issue failed';
      showError(msg);
      console.error('Issue upload error', err.response || err);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!id) return;
    setUploading(true);
    try {
      const res = await adminCertificatesAPI.issueGenerate(id);
      setCertificate(res.data.data.certificate);
      showSuccess('Certificate generated and issued');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Generation failed';
      showError(msg);
      console.error('Generate issue error', err.response || err);
    } finally {
      setUploading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      const res = await adminCertificatesAPI.reject(id, notes);
      setCertificate(res.data.data.certificate);
      showSuccess('Certificate request rejected');
      // navigate back to list
      navigate('/admin/certificates');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Reject failed';
      showError(msg);
      console.error('Reject error', err.response || err);
    }
  };

  if (loading) return <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
  if (!certificate) return <div className="text-gray-400">Certificate not found</div>;

  const courseTitle = certificate.enrollment?.course?.title || 'Course';

  return (
    <div className="space-y-6">
      <SEO title={`Certificate ${certificate._id}`} description={`Certificate request`} />
      <h1 className="text-xl font-bold text-white">Certificate Request</h1>

      <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-lg p-5 border border-gray-700">
        <div className="flex items-start gap-4">
          {certificate.student?.avatar ? (
            <img src={certificate.student.avatar} alt={certificate.student?.name || 'Student avatar'} className="w-14 h-14 rounded-full object-cover text-white font-bold text-lg" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {(certificate.student?.name || 'U').split(' ').map((s: string) => s[0]).slice(0,2).join('')}
            </div>
          )}
          <div className="flex-1">
            <div className="text-sm text-gray-400">Student</div>
            <div className="font-semibold text-white">{certificate.student?.name}</div>
            <div className="text-xs text-gray-400">{certificate.student?.email}</div>
            <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded bg-indigo-700 text-xs text-white"><FileText className="w-3 h-3" /> {courseTitle}</div>
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-2"><User className="w-3 h-3" /> Requested: {new Date(certificate.requestAt).toLocaleString()}</div>
            {certificate.meta?.serial && <div className="mt-1 text-xs text-gray-400">Serial: <span className="text-indigo-300 font-medium">{certificate.meta.serial}</span></div>}
          </div>

          <div className="ml-auto flex flex-col items-end gap-3">
            <span className={`${statusClass(certificate.status)} px-3 py-1 rounded-full text-xs font-medium`}>{certificate.status}</span>

            {certificate.status === 'issued' && certificate.fileUrl ? (
              <div className="flex gap-2">
                <button onClick={() => handleDownload(certificate._id, certificate.enrollment?.course?.title)} disabled={downloading} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {downloading ? 'Downloading...' : 'Download'}</button>
                <button onClick={handlePreview} disabled={downloading} className="px-3 py-1 rounded bg-gray-800 text-white text-sm">Preview</button>
                <button onClick={() => navigate('/admin/certificates')} className="px-3 py-1 rounded bg-gray-700 text-white text-sm">Back to list</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {certificate.status !== 'issued' && (
        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <h3 className="font-medium text-white">Issue Certificate</h3>
          <form onSubmit={handleUpload} className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <label htmlFor="certificate-file" className="sr-only">Upload certificate (PDF)</label>
              <input id="certificate-file" aria-label="Certificate PDF file" accept="application/pdf" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="text-sm" />
              <button type="submit" disabled={uploading || !file} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">{uploading ? 'Issuing...' : 'Upload & Issue'}</button>
            </div>
            <div className="text-xs text-gray-400">OR</div>
            <div>
              <button type="button" onClick={handleGenerate} disabled={uploading} className="px-3 py-1 rounded bg-yellow-600 text-black text-sm">{uploading ? 'Generating...' : 'Generate & Issue'}</button>
            </div>
            <div>
              <label htmlFor="issue-notes" className="text-sm text-gray-300">Notes (optional)</label>
              <input id="issue-notes" placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded bg-gray-900 px-3 py-2 text-white text-sm mt-1" />
            </div>
          </form>
        </div>
      )}

      {certificate.status !== 'rejected' && (
        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <h3 className="font-medium text-white">Reject Request</h3>
          <div className="mt-3 space-y-2">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded bg-gray-800 px-2 py-1 text-white text-sm" rows={3} placeholder="Reason for rejection (optional)" />
            <div className="flex gap-2">
              <button onClick={handleReject} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Reject Request</button>
              <button onClick={() => navigate('/admin/certificates')} className="px-3 py-1 rounded bg-gray-700 text-white text-sm">Back to list</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewOpen && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded w-11/12 md:w-3/4 h-4/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-white">Preview: {courseTitle}</div>
              <button onClick={closePreview} className="px-2 py-1 rounded bg-gray-700 text-white">Close</button>
            </div>
            <iframe src={previewUrl} className="w-full h-full" title="Certificate preview" />
          </div>
        </div>
      )}
    </div>
  );
}
