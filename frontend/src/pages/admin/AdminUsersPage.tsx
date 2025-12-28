import { useEffect, useState, useRef, useCallback } from 'react';
import { userAdminAPI } from '../../lib/api';
import { showSuccess, showError } from '../../lib/toastUtils';
import { Loader2 } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import SEO from '../../components/SEO';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [pageTitle, setPageTitle] = useState('Manage Users');

  useEffect(() => {
    setPageTitle(users.length > 0 ? `${users.length} Users | Admin` : 'Manage Users');
  }, [users.length]);  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | ''>('');
  const [statusFilter, setStatusFilter] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const didMountRef = useRef(false);
  const fetchUsersRef = useRef<any>(null);

  const fetchUsers = useCallback(async (p = 1, q = '') => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 20 };
      if (q) params.search = q;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === 'active';
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await userAdminAPI.getAll(params);
      setUsers(res.data.data.users);
      if (res.data.data.pagination) {
        setPage(res.data.data.pagination.page);
        setTotalPages(res.data.data.pagination.pages);
      } else {
        setPage(1);
        setTotalPages(1);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, fromDate, toDate]);

  // Initial load
  useEffect(() => {
    setInitialLoading(true);
    fetchUsers()
      .finally(() => {
        setInitialLoading(false);
        didMountRef.current = true;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep a ref to latest fetchUsers so debounce doesn't re-run when fetchUsers identity changes
  useEffect(() => {
    fetchUsersRef.current = fetchUsers;
  }, [fetchUsers]);

  // Debounced search: wait 300ms after the user stops typing
  const searchDebounceRef = useRef<number | null>(null);
  useEffect(() => {
    // skip the very first mount run to avoid duplicate call (initial load already fetched)
    if (!didMountRef.current) return;

    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = window.setTimeout(() => {
      fetchUsersRef.current(1, query);
    }, 300);
    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
  }, [query]);

  // Refetch immediately when filters change
  useEffect(() => {
    // When filters change we want immediate result
    fetchUsers(1, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter, fromDate, toDate]);

  const handleRole = async (id: string, role: 'user' | 'admin') => {
    try {
      await userAdminAPI.updateRole(id, role);
      showSuccess('Role updated');
      fetchUsers(page, query);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await userAdminAPI.updateStatus(id, isActive);
      showSuccess(isActive ? 'User activated' : 'User deactivated');
      fetchUsers(page, query);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name?: string } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleDelete = (id: string, name?: string) => {
    setConfirmTarget({ id, name });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      await userAdminAPI.remove(confirmTarget.id);
      showSuccess('User deleted');
      setConfirmOpen(false);
      setConfirmTarget(null);
      fetchUsers(page, query);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelDelete = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setConfirmTarget(null);
  };


  const exportCSVServer = async () => {
    setExporting(true);
    try {
      const params: any = {};
      if (query) params.search = query;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === 'active';
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const resp = await userAdminAPI.exportUsers(params);
      const blob = new Blob([resp.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      showSuccess('CSV downloaded');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SEO title={pageTitle} description={`Manage platform users (${users.length})`} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Manage Users</h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search users by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search users by name or email"
            disabled={initialLoading}
            className={`px-3 py-2 rounded bg-gray-900 text-white ${initialLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          <select aria-label="Role filter" title="Role filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} disabled={initialLoading} className={`px-3 py-2 rounded bg-gray-900 text-white ${initialLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select aria-label="Status filter" title="Status filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} disabled={initialLoading} className={`px-3 py-2 rounded bg-gray-900 text-white ${initialLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            type="date"
            title="From date"
            placeholder="From"
            aria-label="From date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            disabled={initialLoading}
            className={`px-3 py-2 rounded bg-gray-900 text-white ${initialLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          <input
            type="date"
            title="To date"
            placeholder="To"
            aria-label="To date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            disabled={initialLoading}
            className={`px-3 py-2 rounded bg-gray-900 text-white ${initialLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          <button
            type="button"
            aria-label="Clear all filters and search"
            onClick={() => { setQuery(''); setRoleFilter(''); setStatusFilter(''); setFromDate(''); setToDate(''); fetchUsers(1, ''); }}
            disabled={initialLoading}
            className={`px-3 py-2 bg-gray-800 text-gray-300 rounded ${initialLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Clear
          </button>
          <button
            onClick={exportCSVServer}
            disabled={initialLoading || exporting}
            className={`px-3 py-2 rounded ${initialLoading || exporting ? 'bg-gray-700 text-gray-300 opacity-60 cursor-not-allowed' : 'bg-gray-700 text-white'}`}
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete user"
        message={confirmTarget ? `Delete ${confirmTarget.name ?? 'this user'}? This action is irreversible.` : 'Delete this user? This action is irreversible.'}
        confirmText="Delete"
        cancelText="Cancel"
        loading={confirmLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {loading ? (
        <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : users.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-6 text-center">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-gray-400">Role</th>
                <th className="px-4 py-3 text-left text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-gray-400">Joined</th>
                <th className="px-4 py-3 text-left text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-indigo-300">{u.email}</td>
                  <td className="px-4 py-3 text-gray-300">{u.role}</td>
                  <td className="px-4 py-3 text-gray-300">{u.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-400">
                    <div className="flex items-center gap-2">
                      {u.role !== 'admin' ? (
                        <button onClick={() => handleRole(u._id, 'admin')} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">Promote</button>
                      ) : (
                        <button onClick={() => handleRole(u._id, 'user')} className="px-2 py-1 bg-gray-700 text-white rounded text-xs">Demote</button>
                      )}
                      <button onClick={() => handleToggleActive(u._id, !u.isActive)} className="px-2 py-1 bg-gray-700 text-white rounded text-xs">{u.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => handleDelete(u._id, u.name)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={() => fetchUsers(Math.max(1, page - 1), query)} disabled={page === 1} className="px-3 py-1 rounded bg-gray-800 text-gray-300">Previous</button>
          <span className="text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => fetchUsers(Math.min(totalPages, page + 1), query)} disabled={page === totalPages} className="px-3 py-1 rounded bg-gray-800 text-gray-300">Next</button>
        </div>
      )}
    </div>
  );
}
