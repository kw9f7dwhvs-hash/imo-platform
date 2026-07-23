'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import ProblemCard from '@/components/ProblemCard';
import { useSession } from 'next-auth/react';

const categories = [
  { id: '', name: 'All' },
  { id: 'A', name: 'Algebra' },
  { id: 'N', name: 'Number Theory' },
  { id: 'G', name: 'Geometry' },
  { id: 'C', name: 'Combinatorics' },
];

export default function ProblemsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [problems, setProblems] = useState<any[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [revealedUnread, setRevealedUnread] = useState(0);
  const [filter, setFilter] = useState({ category: '', difficulty: '' });
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    const params = new URLSearchParams();
    if (tab === 'history') params.set('history', 'true');
    if (filter.category) params.set('category', filter.category);
    if (filter.difficulty) params.set('difficulty', filter.difficulty);
    const r = await fetch('/api/problems?' + params.toString());
    const data = await r.json();
    setProblems(data.problems || []);
    setActiveCount(data.activeCount || 0);
    setRevealedUnread(data.revealedUnreadCount || 0);
    setLoading(false);
  };

  useEffect(() => { if (session) fetchProblems(); }, [session, filter, refreshKey, tab]);

  // Auto-refresh when tab gains focus
  useEffect(() => {
    const handleFocus = () => setRefreshKey(k => k + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (user?.role === 'admin') {
    return <AuthGuard requiredRole="admin"><p className="text-gray-500">Admins manage problems from the admin panel.</p></AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{tab === 'active' ? 'Problems' : 'Completed'}</h1>
          <span className="text-sm text-gray-500">{tab === 'active' ? 'Active: ' + activeCount + '/8' : (problems.length + ' completed')}</span>
          <button onClick={() => setRefreshKey(k => k + 1)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">Refresh</button>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setTab('active')} className={'px-3 py-1 text-sm rounded-md ' + (tab === 'active' ? 'bg-white shadow-sm font-medium' : 'text-gray-500')}>Active</button>
            <button onClick={() => setTab('history')} className={'px-3 py-1 text-sm rounded-md ' + (tab === 'history' ? 'bg-white shadow-sm font-medium' : 'text-gray-500')}>Done</button>
          </div>
        </div>

        {tab === 'active' && revealedUnread > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            You have {revealedUnread} answer{revealedUnread > 1 ? 's' : ''} to read. Go to the problem to mark it as read.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} className="px-3 py-1.5 border rounded-lg text-sm">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filter.difficulty} onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))} className="px-3 py-1.5 border rounded-lg text-sm">
            <option value="">All Stars</option>
            <option value="1">★1</option>
            <option value="2">★2</option>
            <option value="3">★3</option>
            <option value="4">★4</option>
            <option value="5">★5</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : problems.length === 0 ? (
          <div className="bg-gray-50 border rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">No problems available</p>
            <p className="text-sm text-gray-400">
              {tab === 'history'
                ? 'No completed problems yet. Finish some problems to see them here.'
                : activeCount >= 8
                ? 'You have 8 active problems. Finish some to unlock new ones.'
                : 'Check back later or ask your teacher to upload problems.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((p: any) => (
              <ProblemCard
                key={p.id}
                id={p.id}
                title={p.title}
                categoryName={p.category?.displayNameCn || p.categoryId}
                difficultyName={p.difficultyTier?.name || ('★' + p.difficultyId)}
                status={p.submission?.status}
                hintsUsed={p.submission?.hintsUsed}
              />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
