import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import SEO from '../components/SEO';
import { collegePublicAPI } from '../lib/api';

export default function CollegeSignupPage() {
  const [form, setForm] = useState({ name: '', whiteLabelUrl: '', customDomain: '', logo: '', adminName: '', adminEmail: '', adminPassword: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.adminPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await collegePublicAPI.signup({ ...form });
      // Save token and redirect to dashboard
      localStorage.setItem('cw_auth_token', res.data.data.token);
      navigate('/college');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <SEO title="College Signup" description="Sign up your college for CodeWeavers" />
      <div className="max-w-2xl w-full">
        <div className="bg-white/5 p-8 rounded-xl border border-white/6">
          <h2 className="text-2xl font-bold mb-2">College Signup</h2>
          <p className="text-sm text-gray-300 mb-4">Create your college account to onboard students and access analytics. Your college will remain unverified until platform approval.</p>

          {error && <div className="bg-red-50 text-red-800 p-2 rounded mb-3">{error}</div>}

          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm text-gray-200">College name</label>
              <input aria-label="College name" placeholder="My College" required className="mt-1 block w-full p-3 rounded bg-white/5 border border-white/6 text-white" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <label className="text-sm text-gray-200">White-label URL (optional)</label>
              <input aria-label="White label URL" placeholder="my-college" className="mt-1 block w-full p-3 rounded bg-white/5 border border-white/6 text-white" value={form.whiteLabelUrl} onChange={(e) => setForm({ ...form, whiteLabelUrl: e.target.value })} />
            </div>

            <div>
              <label className="text-sm text-gray-200">Admin name</label>
              <input aria-label="Admin name" placeholder="TPO Name" required className="mt-1 block w-full p-3 rounded bg-white/5 border border-white/6 text-white" value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
            </div>

            <div>
              <label className="text-sm text-gray-200">Admin email</label>
              <input aria-label="Admin email" placeholder="tpo@college.edu" required type="email" className="mt-1 block w-full p-3 rounded bg-white/5 border border-white/6 text-white" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
            </div>

            <div>
              <label className="text-sm text-gray-200">Admin password</label>
              <div className="relative">
                <input aria-label="Admin password" placeholder="Choose a secure password" required type={showPassword ? 'text' : 'password'} className="mt-1 block w-full p-3 pr-12 rounded bg-white/5 border border-white/6 text-white" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-200">Confirm password</label>
              <div className="relative">
                <input aria-label="Confirm password" placeholder="Repeat password" required type={showConfirmPassword ? 'text' : 'password'} className="mt-1 block w-full p-3 pr-12 rounded bg-white/5 border border-white/6 text-white" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-primary-600 text-white">{loading ? 'Creating...' : 'Create College'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
