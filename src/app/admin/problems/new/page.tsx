'use client';
import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';

export default function NewProblemPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', categoryId: 'A', difficultyId: '1',
    problemText: '', hint1Text: '', hint2Text: '', hint3Text: '', answerText: '',
  });
  const [problemFiles, setProblemFiles] = useState<File[]>([]);
  const [hintFiles, setHintFiles] = useState<(File | null)[]>([null, null, null]);
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.set('title', form.title);
    fd.set('categoryId', form.categoryId);
    fd.set('difficultyId', form.difficultyId);
    fd.set('problemText', form.problemText);
    fd.set('hint1Text', form.hint1Text);
    fd.set('hint2Text', form.hint2Text);
    fd.set('hint3Text', form.hint3Text);
    fd.set('answerText', form.answerText);
    problemFiles.forEach(f => fd.append('problemImages', f));
    if (hintFiles[0]) fd.set('hint1Image', hintFiles[0]);
    if (hintFiles[1]) fd.set('hint2Image', hintFiles[1]);
    if (hintFiles[2]) fd.set('hint3Image', hintFiles[2]);
    answerFiles.forEach(f => fd.append('answerImages', f));

    const res = await fetch('/api/admin/problems', { method: 'POST', body: fd });
    if (res.ok) { alert('Problem created!'); router.push('/admin/problems'); }
    else alert('Failed to create problem');
    setSubmitting(false);
  };

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  return (
    <AuthGuard requiredRole="admin">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">New Problem</h1>
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
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select value={form.difficultyId} onChange={e => set('difficultyId', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="1">★1 (10 XP)</option>
                <option value="2">★2 (30 XP)</option>
                <option value="3">★3 (90 XP)</option>
                <option value="4">★4 (270 XP)</option>
                <option value="5">★5 (810 XP)</option>
              </select>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <h3 className="font-medium">Problem Statement</h3>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Text / LaTeX (use $...$ for inline math, $$...$$ for block math)</label>
              <textarea value={form.problemText} onChange={e => set('problemText', e.target.value)} rows={4}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="Find all integers $n$ such that $$n^2 + 1$$ is divisible by $n+1$." />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Or upload image(s)</label>
              <input type="file" multiple accept="image/*" onChange={e => setProblemFiles(Array.from(e.target.files || []))} className="block w-full text-sm" />
            </div>
          </div>

          {/* Hints */}
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <h3 className="font-medium">Hint {i}</h3>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Text / LaTeX</label>
                <textarea value={(form as any)['hint' + i + 'Text'] || ''}
                  onChange={e => set('hint' + i + 'Text', e.target.value)} rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="First observe that..." />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Or upload image</label>
                <input type="file" accept="image/*" onChange={e => {
                  const next = [...hintFiles];
                  next[i - 1] = e.target.files?.[0] || null;
                  setHintFiles(next);
                }} className="block w-full text-sm" />
              </div>
            </div>
          ))}

          {/* Answer */}
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <h3 className="font-medium">Answer / Solution</h3>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Text / LaTeX</label>
              <textarea value={form.answerText} onChange={e => set('answerText', e.target.value)} rows={5}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="We prove that $n=1$ is the only solution..." />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Or upload image(s)</label>
              <input type="file" multiple accept="image/*" onChange={e => setAnswerFiles(Array.from(e.target.files || []))} className="block w-full text-sm" />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Problem'}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
