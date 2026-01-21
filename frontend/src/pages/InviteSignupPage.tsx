import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SEO from '../components/SEO';
import api from '../lib/api';

const inviteSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((v) => v === true, { message: 'You must accept Terms & Privacy' }),
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type InviteForm = z.infer<typeof inviteSchema>;

export default function InviteSignupPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<InviteForm>({ resolver: zodResolver(inviteSchema) });

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await api.get(`/invite/${token}`);
        setInviteInfo(res.data.data.invite);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid invite');
      }
    })();
  }, [token]);

  const onSubmit = async (data: InviteForm) => {
    setError(null);
    setLoading(true);
    try {
      const payload: any = { name: data.name, email: data.email, password: data.password, termsAccepted: data.termsAccepted };
      const res = await api.post(`/invite/${token}/signup`, payload);
      // Save token and redirect to dashboard
      localStorage.setItem('cw_auth_token', res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Join via invite" description="Complete your invite-based signup" />
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/5 p-8 rounded-xl border border-white/6">
            <h2 className="text-2xl font-bold mb-2">Join {inviteInfo?.college?.name || 'CodeWeavers'}</h2>
            {inviteInfo?.expiresAt && <p className="text-sm text-gray-300 mb-4">Invite expires: {new Date(inviteInfo.expiresAt).toLocaleString()}</p>}
            {error && <div className="bg-red-50 text-red-800 p-2 rounded mb-3">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-200">Full name</label>
                <input type="text" {...register('name')} className="mt-1 block w-full p-3 rounded bg-white/5 border border-white/6 text-white" />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-200">Email</label>
                <input type="email" {...register('email')} defaultValue={inviteInfo?.email || ''} className="mt-1 block w-full p-3 rounded bg-white/5 border border-white/6 text-white" />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-200">Password</label>
                <input type="password" {...register('password')} className="mt-1 block w-full p-3 rounded bg-white/5 border border-white/6 text-white" />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-200">Confirm password</label>
                <input type="password" {...register('confirmPassword')} className="mt-1 block w-full p-3 rounded bg-white/5 border border-white/6 text-white" />
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" {...register('termsAccepted')} className="mt-1 h-4 w-4 rounded border-white/10 bg-white/5" />
                <label className="text-sm text-gray-300">I agree to the <a href="/terms" className="text-primary-300">Terms</a> and <a href="/policies" className="text-primary-300">Privacy Policy</a></label>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 rounded bg-primary-600 text-white">{loading ? 'Signing up...' : 'Complete Signup'}</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
