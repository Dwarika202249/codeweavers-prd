import { useCallback, useEffect, useState } from 'react';
import { courseAPI } from '../../lib/api';
import type { Course } from '../../lib/api';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog';
import SEO from '../../components/SEO';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback((opts?: { published?: 'all' | boolean }) => {
    setLoading(true);
    setError(null);
    const params: any = { page: 1, limit: 50 };
    if (opts && typeof opts.published !== 'undefined') params.published = opts.published;
    else params.published = 'all'; // admin list should show all by default

    courseAPI.getAll(params)
      .then((res) => setCourses(res.data.data.courses))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; title?: string } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleDelete = (id: string, title?: string) => {
    setConfirmTarget({ id, title });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      await courseAPI.remove(confirmTarget.id);
      fetchCourses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
      setConfirmLoading(false);
    }
  };

  const handleTogglePublished = async (id: string, current: boolean) => {
    try {
      await courseAPI.update(id, { published: !current });
      fetchCourses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update published status');
    }
  };

  const handleCancelDelete = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  return (
    <div className="space-y-6">
      <SEO title={`Courses | Admin (${courses.length})`} description="Create, edit and publish courses" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Manage Courses</h1>
        <Link to="/admin/courses/new" className="inline-flex items-center gap-2 rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          <Plus className="w-4 h-4" /> New Course
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400">Title</th>
                <th className="px-4 py-3 text-left text-gray-400">Level</th>
                <th className="px-4 py-3 text-left text-gray-400">Duration</th>
                <th className="px-4 py-3 text-left text-gray-400">Price</th>
                <th className="px-4 py-3 text-left text-gray-400">Published</th>
                <th className="px-4 py-3 text-left text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-gray-300">{c.level}</td>
                  <td className="px-4 py-3 text-gray-400">{c.duration}</td>
                  <td className="px-4 py-3 text-gray-400">{c.price ?? 'Free'}</td>
                  <td className="px-4 py-3 text-gray-400">{c.published ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/courses/${c._id}/edit`} className="text-indigo-400 hover:text-indigo-300"><Edit className="w-4 h-4" /></Link>
                      <button aria-label={c.published ? 'Unpublish course' : 'Publish course'} onClick={() => handleTogglePublished(c._id, !!c.published)} className="text-yellow-400 hover:text-yellow-300 text-xs">{c.published ? 'Unpublish' : 'Publish'}</button>
                      <button aria-label="Delete course" onClick={() => handleDelete(c._id, c.title)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete course"
        message={confirmTarget ? `Delete ${confirmTarget.title ?? 'this course'}? This action is irreversible.` : 'Delete this course? This action is irreversible.'}
        confirmText="Delete"
        cancelText="Cancel"
        loading={confirmLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
