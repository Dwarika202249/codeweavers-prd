import { useEffect, useState } from 'react';
import { collegeAdminAPI, inviteAPI } from '../../lib/api';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<any | null>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [invitesStats, setInvitesStats] = useState<any>(null);
  const [showInvites, setShowInvites] = useState(false);
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviteForm, setInviteForm] = useState<{ email: string; type: 'student' | 'tpo'; expiresInHours: number }>({ email: '', type: 'student', expiresInHours: 168 });
  const [confirmRevoke, setConfirmRevoke] = useState<{ open: boolean; token?: string }>({ open: false });

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    setLoading(true);
    try {
      const res = await collegeAdminAPI.list({ page: 1, limit: 50 });
      setColleges(res.data.data.colleges || []);
    } catch (err) {
      // silent
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openInvites = async (college: any) => {
    setSelectedCollege(college);
    setShowInvites(true);
    await loadInvites(college._id);
  };

  const loadInvites = async (collegeId: string) => {
    try {
      const res = await collegeAdminAPI.getInvites(collegeId);
      setInvites(res.data.data.invites || []);
      setInvitesStats(res.data.data.stats || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvite = async () => {
    if (!selectedCollege) return;
    setCreating(true);
    try {
      const res = await collegeAdminAPI.createInvite(selectedCollege._id, inviteForm);
      // refresh invites list
      await loadInvites(selectedCollege._id);
      setShowCreateInvite(false);
      setInviteForm({ email: '', type: 'student', expiresInHours: 168 });
      // show quick alert
      alert('Invite created. Token: ' + (res.data.data.token || ''));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create invite');
    } finally {
      setCreating(false);
    }
  };

  const handleResend = async (token: string) => {
    try {
      await inviteAPI.resend(token);
      await loadInvites(selectedCollege!._id);
      alert('Invite resent');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resend');
    }
  };

  const handleRevoke = async () => {
    if (!confirmRevoke.token) return;
    try {
      await inviteAPI.revoke(confirmRevoke.token);
      setConfirmRevoke({ open: false });
      await loadInvites(selectedCollege!._id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to revoke');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Colleges</h2>
      </div>

      <div className="bg-gray-900 rounded-md border border-gray-800 p-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-400">
                <th className="pb-2">Name</th>
                <th className="pb-2">Slug</th>
                <th className="pb-2">Verified</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((c) => (
                <tr key={c._id} className="border-t border-gray-800">
                  <td className="py-3">{c.name}</td>
                  <td className="py-3">{c.slug}</td>
                  <td className="py-3">{c.verified ? 'Yes' : 'No'}</td>
                  <td className="py-3 space-x-2">
                    <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => openInvites(c)}>Invites</button>
                    <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={() => { setSelectedCollege(c); setShowCreateInvite(true); }}>Create Invite</button>
                    {!c.verified ? (
                      <button className="px-3 py-1 rounded bg-yellow-500 text-white" onClick={async () => { try { await collegeAdminAPI.verify(c._id, true); await loadColleges(); alert('College verified'); } catch (err) { alert(err instanceof Error ? err.message : 'Failed to verify'); } }}>Verify</button>
                    ) : (
                      <span className="text-sm text-gray-400">Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invites modal */}
      {showInvites && selectedCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowInvites(false)} />
          <div className="relative w-full max-w-3xl bg-gray-900 border border-gray-800 rounded p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invites - {selectedCollege.name}</h3>
              <div>
                {invitesStats && <span className="text-sm text-gray-300">Total: {invitesStats.total} • Used: {invitesStats.usedCount} • Revoked: {invitesStats.revokedCount}</span>}
              </div>
            </div>

            <div className="mb-4">
              <button className="px-3 py-1 rounded bg-green-600 text-white mr-2" onClick={() => { setShowCreateInvite(true); }}>Create Invite</button>
              <button className="px-3 py-1 rounded bg-gray-700 text-white" onClick={() => loadInvites(selectedCollege._id)}>Refresh</button>
            </div>

            <div className="overflow-y-auto max-h-96">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-400">
                    <th className="pb-2">Token</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Sent</th>
                    <th className="pb-2">Used / Expires</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((inv) => (
                    <tr key={inv._id} className="border-t border-gray-800">
                      <td className="py-2 text-sm">{inv.token.slice(0, 12)}{inv.token.length > 12 ? '...' : ''}</td>
                      <td className="py-2">{inv.type}</td>
                      <td className="py-2 text-sm">{inv.email || '-'}</td>
                      <td className="py-2 text-sm">{inv.sentCount || 0} times<br />{inv.lastSentAt ? new Date(inv.lastSentAt).toLocaleString() : ''}</td>
                      <td className="py-2 text-sm">{inv.usedAt ? `Used: ${new Date(inv.usedAt).toLocaleString()}` : `Expires: ${inv.expiresAt ? new Date(inv.expiresAt).toLocaleString() : 'Never'}`}</td>
                      <td className="py-2 space-x-2">
                        <button className="px-2 py-1 rounded bg-indigo-600 text-white text-sm" onClick={() => handleResend(inv.token)}>Resend</button>
                        <button className="px-2 py-1 rounded bg-red-600 text-white text-sm" onClick={() => setConfirmRevoke({ open: true, token: inv.token })}>Revoke</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <button className="px-3 py-1 rounded bg-gray-700 text-white" onClick={() => setShowInvites(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invite Dialog */}
      {showCreateInvite && selectedCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowCreateInvite(false)} />
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded p-6">
            <h3 className="text-lg font-semibold mb-2">Create Invite - {selectedCollege.name}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300">Email (optional)</label>
                <input aria-label="Invite email" placeholder="student@college.edu" className="mt-1 block w-full p-2 rounded bg-white/5 border border-white/6 text-white" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Type</label>
                <select aria-label="Invite type" className="mt-1 block w-full p-2 rounded bg-white/5 border border-white/6 text-white" value={inviteForm.type} onChange={(e) => setInviteForm({ ...inviteForm, type: e.target.value as 'student' | 'tpo' })}>
                  <option value="student">Student</option>
                  <option value="tpo">TPO / College Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300">Expires (hours)</label>
                <input aria-label="Expires hours" type="number" placeholder="168" className="mt-1 block w-full p-2 rounded bg-white/5 border border-white/6 text-white" value={inviteForm.expiresInHours} onChange={(e) => setInviteForm({ ...inviteForm, expiresInHours: Number(e.target.value) })} />
              </div>

              <div className="flex justify-end gap-2">
                <button className="px-3 py-1 rounded bg-gray-700 text-white" onClick={() => setShowCreateInvite(false)}>Cancel</button>
                <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={handleCreateInvite} disabled={creating}>{creating ? 'Creating...' : 'Create & Send'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmRevoke.open}
        title="Revoke invite"
        message="Are you sure you want to revoke this invite? Users will no longer be able to use it."
        confirmText="Revoke"
        onConfirm={handleRevoke}
        onCancel={() => setConfirmRevoke({ open: false })}
      />
    </div>
  );
}
