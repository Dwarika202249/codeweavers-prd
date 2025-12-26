import { useEffect, useState } from 'react';
import { enrollmentAPI } from '../../lib/api';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import '../../styles/progress.css';

export default function MyCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    enrollmentAPI.getMy()
      .then((res) => setEnrollments(res.data.data.enrollments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">My Courses</h1>

      {loading ? (
        <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : enrollments.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-6 text-center">You are not enrolled in any course yet. <Link to="/bootcamps" className="text-indigo-400 hover:underline">Browse courses</Link></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrollments.map((e) => (
            <div key={e._id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="font-medium text-white">{e.course.title}</h3>
              <p className="text-sm text-gray-400">{e.course.shortDescription}</p>
              <div className="mt-3 flex items-center justify-between">
                <progress className="w-40 h-3 progress-bar" value={Math.max(0, Math.min(100, e.progress ?? 0))} max={100} aria-label="Course progress" />
                <div className="text-sm text-gray-300">{e.progress ?? 0}%</div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link to={`/bootcamps/${e.course.slug}`} className="px-3 py-2 rounded bg-indigo-600 text-white">Continue</Link>
                <Link to={`/dashboard/courses/${e._id}`} className="px-3 py-2 rounded bg-gray-700 text-white">Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
