import { useEffect, useState } from 'react';
import { enrollmentAPI, downloadAPI } from '../lib/api';
import { Loader2 } from 'lucide-react';
import { showError } from '../lib/toastUtils';

export default function CertificatesList() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string, filename?: string) => {
    setDownloadingId(id);
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
      const msg = err?.message || 'Download failed';
      showError(msg);
      console.error('Certificate download error', err);
    } finally {
      setDownloadingId(null);
    }
  }; 

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    enrollmentAPI.getMyCertificates()
      .then((res) => {
        if (!mounted) return;
        setCertificates(res.data.data.certificates || []);
      })
      .catch((err: any) => {
        if (!mounted) return;
        // If the endpoint isn't found or there are no certificates, show a friendly empty state
        const status = err?.response?.status;
        if (status === 404) {
          setCertificates([]);
        } else {
          const msg = err.message || 'Failed to load certificates';
          setError(msg);
          showError(msg);
        }
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="py-4 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /> Checking certificates…</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (certificates.length === 0) return <div className="text-gray-400">No certificates yet.</div>;

  return (
    <div className="mt-3 space-y-2">
      {certificates.map((c) => (
        <div key={c._id} className="flex items-center justify-between p-3 rounded bg-gray-900 border border-gray-800">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{c.enrollment?.course?.title || 'Course'}</div>
            <div className="text-xs text-gray-400">Requested: {new Date(c.requestAt).toLocaleDateString()}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-xs ${c.status === 'issued' ? 'text-green-300' : c.status === 'rejected' ? 'text-red-400' : 'text-yellow-300'}`}>{c.status}</div>
            {c.status === 'issued' && (
              <button onClick={() => handleDownload(c._id, c.enrollment?.course?.title)} disabled={downloadingId === c._id} className="px-3 py-1 rounded bg-indigo-600 text-white text-xs">{downloadingId === c._id ? 'Downloading...' : 'Download'}</button>
            )} 
          </div>
        </div>
      ))}
    </div>
  );
}
