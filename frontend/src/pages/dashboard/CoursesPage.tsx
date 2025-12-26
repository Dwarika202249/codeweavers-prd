import { useCallback, useEffect, useState } from 'react';
import { courseAPI } from '../../lib/api';
import type { Course } from '../../lib/api';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    setError(null);
    courseAPI.getAll({ page: 1, limit: 50 })
      .then((res) => setCourses(res.data.data.courses))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try {
      await courseAPI.remove(id);
      fetchCourses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
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
                      <button aria-label="Delete course" onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
