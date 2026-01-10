import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { authAPI, uploadsAPI } from '../../lib/api';
import { showSuccess, showError } from '../../lib/toastUtils';
import { Mail, Bell, Trash, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog';
import SEO from '../../components/SEO';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function UserSettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);

  useEffect(() => {
    // Load preferences from localStorage (non-critical)
    const prefs = localStorage.getItem('user:preferences');
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs);
        setEmailNotifications(Boolean(parsed.emailNotifications ?? true));
        setProductUpdates(Boolean(parsed.productUpdates ?? true));
      } catch (err) {
        // ignore
      }
    }
  }, []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', avatar: '' },
  });

  useEffect(() => {
    if (user) setValue('name', user.name);
  }, [user, setValue]);

  const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showError('Image is too large. Please use an image under 2MB.'); return; }

    // Try to upload the avatar to server/Cloudinary
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await uploadsAPI.uploadAvatar(form);
      const url = res.data.data.url || null;
      const updatedUser = res.data.data.user || null;
      if (url) setAvatarPreview(url);
      if (updatedUser) updateUser(updatedUser);
      setValue('avatar', '');
      showSuccess('Avatar uploaded');
      return;
    } catch (err: any) {
      // fallback to client-side data URL preview if upload fails
      try {
        const dataUrl = await fileToDataUrl(file);
        setAvatarPreview(dataUrl);
        setValue('avatar', dataUrl);
        showError('Upload failed, using local preview. Save profile to persist.');
      } catch (readErr) {
        showError('Failed to read image file');
      }
    }
  };

  const onSaveProfile = async (data: any) => {
    setIsSavingProfile(true);
    try {
      const payload: any = { name: data.name };
      if (data.avatar) payload.avatar = data.avatar;
      const res = await authAPI.updateProfile(payload);
      const updatedUser = res.data.data.user;
      updateUser(updatedUser);
      showSuccess('Profile updated');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally { setIsSavingProfile(false); }
  };

  const { register: pwRegister, handleSubmit: handlePwSubmit, formState: { errors: pwErrors }, reset: resetPw } = useForm({ resolver: zodResolver(passwordSchema) });

  const onChangePassword = async (data: any) => {
    setIsChangingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      showSuccess('Password changed successfully');
      resetPw();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to change password');
    } finally { setIsChangingPassword(false); }
  };

  const savePreferences = () => {
    const payload = { emailNotifications, productUpdates };
    localStorage.setItem('user:preferences', JSON.stringify(payload));
    showSuccess('Preferences saved');
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [showRemoveAvatarDialog, setShowRemoveAvatarDialog] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  const requestAccountDeletion = () => {
    if (!user) return;
    setDeletePassword('');
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const performAccountDeletion = async () => {
    // Extra safety: require the admin phrase
    if (deleteConfirmText !== 'DELETE') {
      showError('Please type DELETE to confirm account deletion');
      return;
    }

    setIsDeleting(true);
    try {
      await authAPI.deleteAccount({ currentPassword: deletePassword || undefined });
      showSuccess('Account deleted. Signing out...');
      setShowDeleteModal(false);
      logout();
      navigate('/');
    } catch (err: any) {
      showError(err?.response?.data?.message || err?.message || 'Failed to delete account');
    } finally { setIsDeleting(false); }
  };

  const performRemoveAvatar = async () => {
    if (!user) return;
    setIsRemovingAvatar(true);
    try {
      const res = await uploadsAPI.deleteAvatar();
      const updatedUser = res.data.data.user || null;
      if (updatedUser) updateUser(updatedUser);
      setAvatarPreview(updatedUser?.avatar || null);
      setShowRemoveAvatarDialog(false);
      showSuccess('Avatar removed');
    } catch (err: any) {
      showError(err?.message || 'Failed to remove avatar');
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <SEO title="Settings" description="Configure your account preferences and notification settings." />
      <h1 className="text-xl font-bold text-white">Settings</h1>

      <section className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-semibold text-white">Account</h2>
        <form onSubmit={handleSubmit(onSaveProfile)} className="mt-3 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">No avatar</div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-300">Email</label>
              <div className="text-sm text-indigo-300 font-medium">{user?.email}</div>
              <div className="mt-3">
                <label htmlFor="avatar-input" className="block text-sm text-gray-300">Change avatar</label>
                <input id="avatar-input" aria-label="Upload avatar" type="file" accept="image/*" onChange={onAvatarChange} className="mt-2 text-sm text-gray-200" />
                <p className="text-xs text-gray-400 mt-1">Max 2MB. Images will be stored as your avatar.</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setShowRemoveAvatarDialog(true)} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Remove avatar</button>
                </div>

              {/* Confirm remove avatar modal */}
              <ConfirmDialog
                open={showRemoveAvatarDialog}
                title="Remove avatar"
                message="This will remove your avatar image from Cloudinary and clear it from your profile. This action is reversible by uploading a new avatar."
                confirmText="Remove"
                cancelText="Cancel"
                loading={isRemovingAvatar}
                onConfirm={performRemoveAvatar}
                onCancel={() => setShowRemoveAvatarDialog(false)}
              />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input {...register('name')} className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-900 text-white" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={isSavingProfile} className="px-4 py-2 bg-indigo-600 text-white rounded">{isSavingProfile ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span> : 'Save Profile'}</button>
          </div>
        </form>
      </section>

      <section className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-semibold text-white">Security</h2>
        <form onSubmit={handlePwSubmit(onChangePassword)} className="space-y-3 mt-3">
          <div>
            <label className="block text-sm font-medium text-gray-300">Current password</label>
            <input {...pwRegister('currentPassword')} type="password" className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-900 text-white" />
            {pwErrors.currentPassword && <p className="mt-1 text-sm text-red-600">{pwErrors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">New password</label>
            <input {...pwRegister('newPassword')} type="password" className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-900 text-white" />
            {pwErrors.newPassword && <p className="mt-1 text-sm text-red-600">{pwErrors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Confirm new password</label>
            <input {...pwRegister('confirmPassword')} type="password" className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-900 text-white" />
            {pwErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{pwErrors.confirmPassword.message}</p>}
          </div>
          <div>
            <button type="submit" disabled={isChangingPassword} className="px-4 py-2 bg-indigo-600 text-white rounded">{isChangingPassword ? 'Changing...' : 'Change Password'}</button>
          </div>
        </form>
      </section>

      <section className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-semibold text-white">Preferences</h2>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-sm text-white">Email notifications</div>
                <div className="text-xs text-gray-400">Receive important emails like updates and receipts.</div>
              </div>
            </div>
            <div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-300">Enable</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-sm text-white">Product updates</div>
                <div className="text-xs text-gray-400">Occasional news about new courses and features.</div>
              </div>
            </div>
            <div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={productUpdates} onChange={(e) => setProductUpdates(e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-300">Enable</span>
              </label>
            </div>
          </div>

          <div className="mt-3">
            <button onClick={savePreferences} className="px-4 py-2 bg-indigo-600 text-white rounded">Save preferences</button>
          </div>
        </div>
      </section>

      <section className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-semibold text-white">Danger zone</h2>
        <p className="text-sm text-gray-400 mt-2">If you want to remove your account, request deletion and our team will assist you.</p>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={requestAccountDeletion} disabled={isDeleting} className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded inline-flex items-center gap-2">
            <Trash className="w-4 h-4" /> Request account deletion
          </button>
        </div>
      </section>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={showDeleteModal}
        title="Delete account"
        message="This will permanently delete your account and all related data (enrollments)."
        confirmText="Delete account"
        cancelText="Cancel"
        loading={isDeleting}
        confirmDisabled={deleteConfirmText !== 'DELETE'}
        onConfirm={performAccountDeletion}
        onCancel={() => setShowDeleteModal(false)}
      >
        <div className="text-sm text-gray-300 mb-2">Enter your current password to confirm deletion (leave blank if you use Google sign-in):</div>
        <input
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          type="password"
          placeholder="Current password"
          className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-800 text-white"
        />
        <div className="text-sm text-gray-300 mt-4 mb-2">Type <strong className="text-red-400">DELETE</strong> to confirm permanent deletion:</div>
        <input
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          type="text"
          placeholder="Type DELETE to confirm"
          className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-800 text-white"
        />
        {deleteConfirmText && deleteConfirmText !== 'DELETE' && (
          <div className="text-xs text-red-400 mt-2">Text does not match. Type DELETE (all caps) to enable deletion.</div>
        )}
      </ConfirmDialog>
    </div>
  );
}
