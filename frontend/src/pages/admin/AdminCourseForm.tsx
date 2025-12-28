import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI } from '../../lib/api';
import { showSuccess, showError } from '../../lib/toastUtils';
import SEO from '../../components/SEO';

export default function AdminCourseForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [form, setForm] = useState<any>({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    duration: '',
    level: 'Beginner',
    price: 0,
    prerequisites: '',
    learningOutcomes: '',
    schedule: '',
    published: false,
    coverImage: '',
    instructor: '',
    tags: '',
    targetAudience: '',
    topics: '',
    curriculum: [],
  });

  useEffect(() => {
    if (!id) return;
    setInitialLoading(true);
    courseAPI.getById(id)
      .then((res) => {
        const c = res.data.data.course;
        setForm({
          title: c.title || '',
          slug: c.slug || '',
          shortDescription: c.shortDescription || '',
          description: c.description || '',
          duration: c.duration || '',
          level: c.level || 'Beginner',
          price: c.price ?? 0,
          prerequisites: (c.prerequisites || []).join('\n'),
          learningOutcomes: (c.learningOutcomes || []).join('\n'),
          schedule: c.schedule || '',
          published: !!c.published,
          coverImage: c.coverImage || '',
          instructor: c.instructor || '',
          tags: (c.tags || []).join(', '),
          targetAudience: (c.targetAudience || []).join(', '),
          topics: (c.topics || []).join(', '),
          curriculum: (c.curriculum || []).map((m: any) => ({
            week: m.week || '',
            title: m.title || '',
            topics: Array.isArray(m.topics) ? m.topics : (typeof m.topics === 'string' ? m.topics.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
            project: m.project || '',
          })),
        });
      })
      .catch((err) => showError(err.message))
      .finally(() => setInitialLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
  };

  const addModule = () => {
    setForm((prev: any) => ({ ...prev, curriculum: [...(prev.curriculum || []), { week: '', title: '', topics: [], project: '' }] }));
  };

  const removeModule = (index: number) => {
    setForm((prev: any) => ({ ...prev, curriculum: (prev.curriculum || []).filter((_: any, i: number) => i !== index) }));
  };

  const updateModule = (index: number, key: string, value: any) => {
    setForm((prev: any) => {
      const curriculum = [...(prev.curriculum || [])];
      if (!curriculum[index]) curriculum[index] = { week: '', title: '', topics: [], project: '' };
      if (key === 'topics') curriculum[index][key] = typeof value === 'string' ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : value;
      else curriculum[index][key] = value;
      return { ...prev, curriculum };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        prerequisites: form.prerequisites ? form.prerequisites.split('\n').map((s: string) => s.trim()).filter(Boolean) : [],
        learningOutcomes: form.learningOutcomes ? form.learningOutcomes.split('\n').map((s: string) => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        targetAudience: form.targetAudience ? form.targetAudience.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        topics: form.topics ? form.topics.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        curriculum: (form.curriculum || []).map((m: any) => ({
          week: m.week || '',
          title: m.title || '',
          topics: Array.isArray(m.topics) ? m.topics : (typeof m.topics === 'string' ? m.topics.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          project: m.project || '',
        })),
      };

      if (id) {
        await courseAPI.update(id, payload);
        showSuccess('Course updated');
      } else {
        await courseAPI.create(payload);
        showSuccess('Course created');
      }
      navigate('/admin/courses');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const seoTitle = id ? (form.title ? `${form.title} | Edit Course` : 'Edit Course') : 'New Course';

  return (
    <div className="max-w-3xl">
      <SEO title={seoTitle} description={form.shortDescription || (id ? 'Edit course details' : 'Create a new course')} />
      <h1 className="text-xl font-bold text-white mb-4">{id ? 'Edit' : 'New'} Course</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">Title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} required className="w-full rounded bg-gray-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-200 mb-1">Slug</label>
          <input id="slug" name="slug" value={form.slug} onChange={handleChange} placeholder="optional - autogenerated from title" className="w-full rounded bg-gray-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-200 mb-1">Short Description</label>
          <input id="shortDescription" name="shortDescription" value={form.shortDescription} onChange={handleChange} className="w-full rounded bg-gray-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} className="w-full rounded bg-gray-800 px-3 py-2 text-white h-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-200 mb-1">Duration</label>
            <input id="duration" name="duration" value={form.duration} onChange={handleChange} className="w-full rounded bg-gray-800 px-3 py-2 text-white" />
          </div>
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-200 mb-1">Level</label>
            <select id="level" title="Level" name="level" value={form.level} onChange={handleChange} className="w-full rounded bg-gray-800 px-3 py-2 text-white">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-200 mb-1">Price</label>
            <input id="price" name="price" type="number" value={form.price} onChange={handleChange} className="w-full rounded bg-gray-800 px-3 py-2 text-white" />
          </div>
        </div>
        <div>
          <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-200 mb-1">Prerequisites (one per line)</label>
          <textarea id="prerequisites" name="prerequisites" value={form.prerequisites} onChange={handleChange} className="w-full rounded bg-gray-800 px-3 py-2 text-white h-24" />
        </div>
        <div>
          <label htmlFor="learningOutcomes" className="block text-sm font-medium text-gray-200 mb-1">Learning Outcomes (one per line)</label>
          <textarea id="learningOutcomes" name="learningOutcomes" value={form.learningOutcomes} onChange={handleChange} className="w-full rounded bg-gray-800 px-3 py-2 text-white h-24" />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-200 mb-1">Tags (comma separated)</label>
          <input id="tags" name="tags" value={form.tags} onChange={handleChange} className="w-full rounded bg-gray-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-200 mb-1">Target Audience (comma separated)</label>
          <input id="targetAudience" name="targetAudience" value={form.targetAudience} onChange={handleChange} placeholder="e.g. College Students, Career Changers" className="w-full rounded bg-gray-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label htmlFor="topics" className="block text-sm font-medium text-gray-200 mb-1">Technologies & Tools (comma separated)</label>
          <input id="topics" name="topics" value={form.topics} onChange={handleChange} placeholder="e.g. React, TypeScript, Tailwind" className="w-full rounded bg-gray-800 px-3 py-2 text-white" />
        </div>

        {/* Curriculum editor */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Curriculum</label>
          <div className="space-y-3">
            {form.curriculum.map((m: any, idx: number) => (
              <div key={idx} className="space-y-2 rounded border border-gray-800 p-3 bg-gray-900">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input name={`curriculum-week-${idx}`} value={m.week} onChange={(e) => updateModule(idx, 'week', e.target.value)} placeholder="Week" className="rounded bg-gray-800 px-2 py-1 text-white" />
                  <input name={`curriculum-title-${idx}`} value={m.title} onChange={(e) => updateModule(idx, 'title', e.target.value)} placeholder="Module title" className="rounded bg-gray-800 px-2 py-1 text-white col-span-2" />
                </div>
                <div>
                  <textarea name={`curriculum-topics-${idx}`} value={(m.topics || []).join(', ')} onChange={(e) => updateModule(idx, 'topics', e.target.value)} placeholder="Topics (comma separated)" className="w-full rounded bg-gray-800 px-2 py-1 text-white h-20" />
                </div>
                <div className="flex items-center gap-2">
                  <input name={`curriculum-project-${idx}`} value={m.project} onChange={(e) => updateModule(idx, 'project', e.target.value)} placeholder="Project (optional)" className="rounded bg-gray-800 px-2 py-1 text-white flex-1" />
                  <button type="button" onClick={() => removeModule(idx)} className="px-2 py-1 rounded bg-red-600 text-white">Remove</button>
                </div>
              </div>
            ))}

            <div>
              <button type="button" onClick={addModule} className="px-3 py-2 rounded bg-indigo-600 text-white">Add Module</button>
            </div>
          </div>
        </div>
        <div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" checked={form.published} onChange={handleChange} className="rounded" />
            <span className="text-gray-200">Published</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" disabled={loading || initialLoading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={() => navigate('/admin/courses')} className="px-4 py-2 bg-gray-800 text-gray-200 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
