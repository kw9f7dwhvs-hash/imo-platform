'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (diffFilter) p.set('difficulty', diffFilter);
    const r = await fetch('/api/admin/problems?' + p.toString());
    if (r.ok) setProblems(await r.json());
    setLoading(false);
  };

  useEffect(() => { fetchProblems(); }, [search, diffFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this problem?')) return;
    await fetch('/api/admin/problems/' + id, { method: 'DELETE' });
    setProblems(p => p.filter(x => x.id !== id));
  };

  const handleClearAll = async () => {
    if (!confirm('Delete ALL problems? This cannot be undone!')) return;
    if (!confirm('Are you sure? All students\' progress will be lost.')) return;
    const r = await fetch('/api/admin/problems/clear-all', { method: 'POST' });
    if (r.ok) { alert('All problems deleted!'); setProblems([]); }
    else alert('Failed to clear');
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Problems ({problems.length})</h1>
          <div className="flex gap-2">
            <button onClick={async () => { if (!confirm("Toggle all?")) return; const ids = problems.map(p => p.id); for (const id of ids) { try { await fetch("/api/admin/problems", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active: false }) }); } catch(e) {} } window.location.reload(); }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">Deactivate All</button>
            <button onClick={async () => {
              if (!confirm("Activate all?")) return;
              for (const p of problems) {
                try { await fetch("/api/admin/problems", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, active: true }) }); } catch(e) {}
              }
              window.location.reload();
            }} className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200">Activate All</button>
            <button onClick={handleClearAll} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">Clear All</button>
            <Link href="/admin/problems/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">New</Link>
          </div>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Search title..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm flex-1" />
          <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm">
            <option value="">All Stars</option>
            <option value="1">★1</option><option value="2">★2</option><option value="3">★3</option><option value="4">★4</option><option value="5">★5</option>
          </select>
        </div>
        {loading ? <p className="text-gray-400">Loading...</p> : problems.length === 0 ? (
          <p className="text-gray-500">No problems yet.</p>
        ) : (
          <div className="bg-white rounded-lg border">
            {problems.map(p => {
              const done = (p.studentStats || []).filter((s: any) => s.status === 'passed');
              const working = (p.studentStats || []).filter((s: any) => s.status === 'pending' || s.status === 'needs_clarification' || s.status === 'needs_correction' || s.status === 'retry');
              const viewed = (p.studentStats || []).filter((s: any) => s.status === 'revealed' || s.status === 'answer_read');
              const isActive = p.active !== false;
              return (
              <div key={p.id} className={"p-4 border-b last:border-b-0 " + (isActive ? '' : 'bg-gray-50')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={isActive} onChange={async () => {
                      try {
                        const res = await fetch('/api/admin/problems', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: p.id, active: !isActive }),
                        });
                        if (!res.ok) alert('Toggle failed: ' + (await res.json()).error);
                      } catch(e: any) { alert('Network error: ' + e.message); }
                      window.location.reload();
                    }} className="w-4 h-4" title={isActive ? 'Active - students can see this' : 'Inactive - hidden from students'} />
                    <div>
                      <p className={"font-medium " + (isActive ? '' : 'text-gray-400 line-through')}>{p.title}</p>
                      <p className="text-sm text-gray-500">
                        {p.category?.displayNameCn || p.categoryId} | {p.difficultyTier?.name} | {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Link href={'/admin/problems/' + p.id + '/edit'} className="text-sm text-blue-500 hover:text-blue-700">Edit</Link>
                    <button onClick={() => handleDelete(p.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
                  </div>
                </div>
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="text-green-600">Passed: {done.length > 0 ? done.map((s: any) => s.username).join(', ') : 'none'}</span>
                  <span className="text-amber-600">Working: {working.length > 0 ? working.map((s: any) => s.username).join(', ') : 'none'}</span>
                  <span className="text-gray-400">Viewed: {viewed.length > 0 ? viewed.map((s: any) => s.username).join(', ') : 'none'}</span>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
