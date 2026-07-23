'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

const catNames: Record<string, string> = { A: 'Algebra', N: 'Number Theory', G: 'Geometry', C: 'Combinatorics' };

const levelTitles: Record<number, string> = {
  1: 'Math Explorer', 2: 'Pattern Seeker', 3: 'Proof Apprentice',
  4: 'Theorem Hunter', 5: 'Conjecture Breaker', 6: 'Olympiad Challenger',
  7: 'Gold Medalist', 8: 'Grandmaster', 9: 'Math Sage', 10: 'IMO Legend',
};

function getTitle(cat: string, level: number): string {
  const keys = Object.keys(levelTitles).map(Number).sort((a, b) => a - b);
  let t = levelTitles[keys[keys.length - 1]];
  for (const k of keys) { if (level >= k) t = levelTitles[k]; }
  return catNames[cat] + ' ' + t;
}

export default function Home() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [stats, setStats] = useState<any>(null);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    fetch('/api/user/profile').then(r => r.json()).then(d => setStats(d));
    fetch('/api/problems').then(r => r.json()).then(d => {
      if (d.activeCount !== undefined) setActiveCount(d.activeCount);
    });
    fetch('/api/check-redos').catch(() => {});
  }, [session]);

  if (!session) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">IMO Training Platform</h1>
        <p className="text-gray-500 mb-8">Master olympiad mathematics with guided practice</p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Login</Link>
          <Link href="/register" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Register</Link>
        </div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <AuthGuard requiredRole="admin">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/problems" className="p-6 bg-white rounded-lg border hover:shadow-md">
              <h2 className="font-semibold text-lg">Manage Problems</h2>
              <p className="text-sm text-gray-500 mt-1">Create, edit problems</p>
            </Link>
            <Link href="/admin/submissions" className="p-6 bg-white rounded-lg border hover:shadow-md">
              <h2 className="font-semibold text-lg">Grade Submissions</h2>
              <p className="text-sm text-gray-500 mt-1">Review and grade student work</p>
            </Link>
            <Link href="/admin/stats" className="p-6 bg-white rounded-lg border hover:shadow-md">
              <h2 className="font-semibold text-lg">Student Stats</h2>
              <p className="text-sm text-gray-500 mt-1">View student progress and pass rates</p>
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          Active problems: <strong>{activeCount}</strong>/8
        </div>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['A', 'N', 'G', 'C'].map(cat => {
              const xp = stats.xp?.[cat] || { totalXp: 0, level: 1 };
              const nextLvlXp = xp.nextLevelXp || 100;
              const currentXp = xp.currentXp || 0;
              const pct = nextLvlXp > 0 ? Math.min(100, (currentXp / nextLvlXp) * 100) : 0;
              return (
                <div key={cat} className="p-4 bg-white rounded-lg border">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{catNames[cat]}</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">{getTitle(cat, xp.level)}</p>
                  <p className="text-xs text-gray-500">Lv.{xp.level} &middot; {xp.totalXp || 0} XP</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: pct + '%' }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{currentXp}/{nextLvlXp} to next</p>
                </div>
              );
            })}
          </div>
        )}
        <Link href="/problems" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          View Problems ({activeCount}/8)
        </Link>
      </div>
    </AuthGuard>
  );
}
