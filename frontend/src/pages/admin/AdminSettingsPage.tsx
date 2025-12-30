import { useEffect, useState } from 'react';
import { adminSettingsAPI, uploadsAPI } from '../../lib/api';
import { Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    adminSettingsAPI.get()
      .then((res) => { if (mounted) setSettings(res.data.data.settings); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        general: settings.general,
        branding: settings.branding,
      };
      const res = await adminSettingsAPI.update(payload);
      setSettings(res.data.data.settings);
    } catch (err) {
      console.error('Save failed', err);
      alert('Save failed');
    } finally { setSaving(false); }
  };

  const uploadLogo = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await uploadsAPI.uploadCourseImage(fd);
    const url = res.data.data.url;
    setSettings((s: any) => ({ ...s, branding: { ...s.branding, logoUrl: url } }));
  };

  if (loading) return <div className="p-6 bg-gray-800 rounded-xl text-center"><Loader2 className="mx-auto animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Admin Settings</h1>

      {/* General */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-medium text-white">General</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400">Site name</label>
            <input aria-label="Site name" title="Site name" placeholder="CodeWeavers" value={settings?.general?.siteName || ''} onChange={(e) => setSettings((s:any)=>({...s, general:{...s.general, siteName:e.target.value}}))} className="mt-1 w-full bg-gray-900 rounded p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400">Tagline</label>
            <input aria-label="Tagline" title="Tagline" placeholder="Short site tagline" value={settings?.general?.tagline || ''} onChange={(e) => setSettings((s:any)=>({...s, general:{...s.general, tagline:e.target.value}}))} className="mt-1 w-full bg-gray-900 rounded p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400">Support email</label>
            <input aria-label="Support email" title="Support email" placeholder="support@codeweavers.in" value={settings?.general?.supportEmail || ''} onChange={(e) => setSettings((s:any)=>({...s, general:{...s.general, supportEmail:e.target.value}}))} className="mt-1 w-full bg-gray-900 rounded p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400">Support phone</label>
            <input aria-label="Support phone" title="Support phone" placeholder="+91 98XXX XXXXX" value={settings?.general?.supportPhone || ''} onChange={(e) => setSettings((s:any)=>({...s, general:{...s.general, supportPhone:e.target.value}}))} className="mt-1 w-full bg-gray-900 rounded p-2 text-white" />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-medium text-white">Branding & Appearance</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400">Logo</label>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-24 h-12 bg-gray-900 rounded flex items-center justify-center overflow-hidden">
                {settings?.branding?.logoUrl ? <img src={settings.branding.logoUrl} alt="logo" className="max-w-full max-h-full"/> : <div className="text-gray-500">No logo</div>}
              </div>
              <input aria-label="Upload logo" title="Upload logo" type="file" accept="image/*" onChange={(e) => e.target.files && uploadLogo(e.target.files[0])} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400">Primary color</label>
            <input aria-label="Primary color" title="Primary color" type="color" value={settings?.branding?.primaryColor || '#3B82F6'} onChange={(e)=> setSettings((s:any)=>({...s, branding:{...s.branding, primaryColor:e.target.value}}))} className="mt-2" />
            <div className="mt-3 text-sm text-gray-400">Preview</div>
            <div className="mt-2 inline-block rounded border overflow-hidden" role="img" aria-label={`Primary color ${settings?.branding?.primaryColor || '#3B82F6'}`}>
              <img alt={`Primary ${settings?.branding?.primaryColor || '#3B82F6'}`} src={`data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='240' height='64'><rect width='100%' height='100%' fill='${settings?.branding?.primaryColor || '#3B82F6'}'/></svg>`)}`} className="w-36 h-14 block" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 rounded text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save settings'}</button>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-700 rounded text-gray-200">Discard</button>
      </div>
    </div>
  );
}
