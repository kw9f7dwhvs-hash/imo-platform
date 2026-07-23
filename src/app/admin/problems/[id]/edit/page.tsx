'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useRouter, useParams } from 'next/navigation';

export default function EditProblemPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', categoryId: 'A', difficultyId: '1',
    problemText: '', hint1Text: '', hint2Text: '', hint3Text: '', answerText: '',
  });

  useEffect(() => {
    fetch('/api/admin/problems/' + id)
      .then(r => r.json())
      .then(d => {
        setForm({
          title: d.title || '',
          categoryId: d.categoryId || 'A',
          difficultyId: String(d.difficultyId || '1'),
          problemText: d.problemText || '',
          hint1Text: d.hint1Text || '',
          hint2Text: d.hint2Text || '',
          hint3Text: d.hint3Text || '',
          answerText: d.answerText || '',
        });
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    const res = await fetch('/api/admin/problems/' + id, { method: 'PUT', body: fd });
    if (res.ok) { alert('Updated!'); router.push('/admin/problems'); }
    else alert('Failed');
    setSubmitting(false);
  };

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  if (loading) return <AuthGuard requiredRole="admin"><p className="text-gray-400 p-4">Loading...</p></AuthGuard>;

  return (
    <AuthGuard requiredRole="admin">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Problem</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="A">Algebra</option>
                <option value="N">Number Theory</option>
                <option value="G">Geometry</option>
                <option value="C">Combinatorics</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Star Rating</label>
              <select value={form.difficultyId} onChange={e => set('difficultyId', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="1">★1 (10 XP)</option>
                <option value="2">★2 (30 XP)</option>
                <option value="3">★3 (90 XP)</option>
                <option value="4">★4 (270 XP)</option>
                <option value="5">★5 (810 XP)</option>
              </select>
            </div>
          </div>
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <h3 className="font-medium">Problem Statement</h3>
            <textarea value={form.problemText} onChange={e => set('problemText', e.target.value)} rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="LaTeX with $...$ and $$...$$" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <h3 className="font-medium">Hint {i} <span className="text-gray-400 text-sm font-normal">(leave empty for no hint)</span></h3>
              <textarea value={(form as any)['hint' + i + 'Text'] || ''}
                onChange={e => set('hint' + i + 'Text', e.target.value)} rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="Optional hint text with LaTeX..." />
            </div>
          ))}
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <h3 className="font-medium">Answer / Solution</h3>
            <textarea value={form.answerText} onChange={e => set('answerText', e.target.value)} rows={5}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="Full solution with LaTeX..." />
          </div>
          <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
