import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showSuccess, showError } from '../../lib/toastUtils';
import { authAPI } from '../../lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', avatar: '' },
  });

  useEffect(() => {
    if (user) setValue('name', user.name);
  }, [user, setValue]);

  // Convert file to data URL
  const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Limit file size to 2MB
    if (file.size > 2 * 1024 * 1024) {
      showError('Image is too large. Please use an image under 2MB.');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarPreview(dataUrl);
      setValue('avatar', dataUrl);
    } catch (err) {
      showError('Failed to read image file');
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
    } finally {
      setIsSavingProfile(false);
    }
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
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Profile</h1>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 max-w-2xl">
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">No avatar</div>
              )}
            </div>
            <div>
              <label htmlFor="avatar-input" className="block text-sm text-gray-300">Change avatar</label>
              <input id="avatar-input" aria-label="Upload avatar" type="file" accept="image/*" onChange={onAvatarChange} className="mt-2 text-sm text-gray-200" />
              <p className="text-xs text-gray-400 mt-1">Max 2MB. Images will be stored as your avatar.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input {...register('name')} className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-900 text-white" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={isSavingProfile} className="px-4 py-2 bg-indigo-600 text-white rounded">Save Profile</button>
            <button type="button" onClick={() => { setAvatarPreview(user?.avatar || null); setValue('avatar', ''); }} className="px-4 py-2 bg-gray-700 text-white rounded">Reset Avatar</button>
          </div>
        </form>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 max-w-2xl">
        <h2 className="text-lg font-semibold text-white">Change password</h2>
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
            <button type="submit" disabled={isChangingPassword} className="px-4 py-2 bg-indigo-600 text-white rounded">Change Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}
