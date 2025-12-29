import { useEffect, useState, useRef, useCallback } from 'react';
import SEO from '../../components/SEO';
import { adminAssignmentsAPI, courseAPI } from '../../lib/api';
import { showError, showSuccess } from '../../lib/toastUtils';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export default function AdminAssignmentsPage() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Searchable course selector state
  const [courseQuery, setCourseQuery] = useState('');
  const [courseOptions, setCourseOptions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const searchTimeoutRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  const searchCourses = useCallback(async (q: string) => {
    try {
      const res = await courseAPI.getAll({ q, limit: 50 });
      setCourseOptions(res.data.data.courses || []);
      setShowDropdown(true);
      setHighlighted(0);
    } catch (err: any) {
      console.error('Course search failed', err);
    } finally {
      setSearching(false);
    }
  }, []);

  const selectCourse = (c: any) => {
    setCourseId(c._id);
    setCourseQuery(c.title);
    setShowDropdown(false);
    setSearching(false);
  };

  // keep options in sync with the full courses list on initial load
  useEffect(() => { setCourseOptions(courses || []); }, [courses]);

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [allowResubmissions, setAllowResubmissions] = useState(true);
  const [maxScore, setMaxScore] = useState<number | undefined>(100);
  const [creating, setCreating] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const [res, coursesRes] = await Promise.all([
        adminAssignmentsAPI.getAll({ limit: 100 }),
        courseAPI.getAll({ limit: 200 }),
      ]);

      setAssignments(res.data.data.assignments || []);
      setCourses(coursesRes.data.data.courses || []);
    } catch (err: any) {
      showError(err?.message || 'Failed to load assignments or courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!title || !courseId) return showError('Title and Course ID are required');
    setCreating(true);
    try {
      await adminAssignmentsAPI.create({ courseId, title, description, dueDate, allowResubmissions, maxScore });
      showSuccess('Assignment created');
      setTitle(''); setCourseId(''); setDescription(''); setDueDate(undefined); setAllowResubmissions(true); setMaxScore(100);
      fetch();
    } catch (err: any) {
      showError(err?.message || 'Create failed');
    } finally { setCreating(false); }
  };

  return (
    <div className="space-y-6">
      <SEO title="Assignments" description="Manage course assignments" />
      <h1 className="text-xl font-bold text-white">Assignments</h1>

      <div className="bg-gray-800 rounded p-4">
        <h3 className="font-medium text-white">Create Assignment</h3>
        <div className="mt-3 space-y-2">
          <label htmlFor="course-search" className="text-xs text-gray-400">Course</label>
          <div ref={wrapperRef} className="relative">
            <input
              id="course-search"
              aria-autocomplete="list"
              aria-controls="course-listbox"
              placeholder="Search courses..."
              value={courseQuery}
              onFocus={() => { setCourseOptions(courses); setShowDropdown(true); setHighlighted(0); }}
              onChange={(e) => {
                const q = e.target.value;
                setCourseQuery(q);
                // schedule debounced search
                if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
                if (q.trim().length === 0) {
                  // reset to initial options and show dropdown
                  setCourseOptions(courses);
                  setShowDropdown(true);
                  setSearching(false);
                  return;
                }
                setSearching(true);
                searchTimeoutRef.current = window.setTimeout(() => {
                  searchCourses(q);
                }, 350);
              }}
              onKeyDown={(e) => {
                if (!showDropdown) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlighted((h) => Math.min((courseOptions.length || 1) - 1, Math.max(0, h + 1)));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlighted((h) => Math.max(0, h - 1));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  const sel = courseOptions[highlighted];
                  if (sel) selectCourse(sel);
                } else if (e.key === 'Escape') {
                  setShowDropdown(false);
                }
              }}
              className="w-full rounded bg-gray-900 px-2 py-1 text-white text-sm"
            />

            <button aria-label="Toggle course dropdown" type="button" onClick={() => { setShowDropdown((s) => !s); setCourseOptions(courses); setCourseQuery(''); setHighlighted(0); }} className="absolute right-2 top-2 text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </button>

            {searching && <div className="absolute right-8 top-2 text-gray-400 text-xs">Searching…</div>}

            {showDropdown && courseOptions.length > 0 && (
              <ul id="course-listbox" role="listbox" aria-label="Search results" className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-800 rounded max-h-48 overflow-auto">
                {courseOptions.map((c, idx) => (
                  <li
                    key={c._id}
                    role="option"
                    onMouseDown={() => selectCourse(c)}
                    onMouseEnter={() => setHighlighted(idx)}
                    className={`px-3 py-2 text-sm cursor-pointer ${idx === highlighted ? 'bg-indigo-700 text-white' : 'text-gray-200 hover:bg-gray-800'}`}
                  >
                    <div className="font-medium truncate">{c.title}</div>
                    <div className="text-xs text-gray-400 truncate">{c.instructor || ''}</div>
                  </li>
                ))}
              </ul>
            )}

            {courseId && (
              <div className="mt-1 text-xs text-gray-400">Selected: {(courses.find((x) => x._id === courseId) || courseOptions.find((x) => x._id === courseId) || { title: '—' }).title} <button type="button" onClick={() => { setCourseId(''); setCourseQuery(''); setCourseOptions(courses); }} className="ml-2 text-xs text-yellow-300">Clear</button></div>
            )}
          </div>

          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded bg-gray-900 px-2 py-1 text-white text-sm" />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded bg-gray-900 px-2 py-1 text-white text-sm" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label htmlFor="due-date" className="text-xs text-gray-400">Due date</label>
              <input id="due-date" title="Due date" type="date" value={dueDate || ''} onChange={(e) => setDueDate(e.target.value || undefined)} className="mt-1 rounded bg-gray-900 px-2 py-1 text-white text-sm" />
            </div>
            <div>
              <label htmlFor="max-score" className="text-xs text-gray-400">Max score</label>
              <input id="max-score" type="number" placeholder="Max score" value={maxScore ?? ''} onChange={(e) => setMaxScore(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 rounded bg-gray-900 px-2 py-1 text-white text-sm" />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" checked={allowResubmissions} onChange={(e) => setAllowResubmissions(e.target.checked)} className="rounded bg-gray-900" /> Allow resubmissions</label>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={creating} className="px-3 py-1 rounded bg-indigo-600 text-white">{creating ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded p-4">
        <h3 className="font-medium text-white">Existing Assignments</h3>
        <div className="mt-3 space-y-2">
          {loading ? <div className="text-gray-400">Loading…</div> : assignments.length === 0 ? <div className="text-gray-400">No assignments</div> : (
            assignments.map((a) => (
              <div key={a._id} className="rounded p-3 bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{a.title}</div>
                  <div className="text-xs text-gray-400 truncate">{a.description}</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/admin/assignments/${a._id}`} className="px-2 py-1 rounded bg-gray-700 text-white text-sm">View</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}