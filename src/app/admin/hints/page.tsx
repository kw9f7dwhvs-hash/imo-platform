'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function AdminHintsPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchPool = () => {
    setLoading(true);
    fetch('/api/admin/hints-pool').then(r => r.json()).then(d => { setEntries(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { fetchPool(); }, []);

  const handleAction = async (poolId: number, action: string) => {
    await fetch('/api/admin/hints-pool', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId, action }),
    });
    fetchPool();
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Hints Pool</h1>
        {loading ? <p className="text-gray-400">Loading...</p> : entries.length === 0 ? (
          <p className="text-gray-500">No hints in pool.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((e: any) => (
              <div key={e.id} className={'bg-white p-4 rounded-lg border ' + (e.status === 'standby' ? 'border-l-4 border-l-amber-400' : '')}>
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{e.problem?.title || 'Problem #' + e.problemId}</p>
                    <p className="text-xs text-gray-500">By {e.submitter?.username} · Hint #{e.hintNumber}</p>
                  </div>
                  <span className={'text-xs px-2 py-0.5 rounded ' + (e.status === 'standby' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}>{e.status}</span>
                </div>
                <p className="text-sm bg-gray-50 p-2 rounded mb-2">{e.hintText}</p>
                {e.status === 'standby' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(e.id, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                    <button onClick={() => handleAction(e.id, 'delete')} className="px-3 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
