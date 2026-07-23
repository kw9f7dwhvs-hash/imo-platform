'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';

const catNames: Record<string, string> = { A: 'Algebra', N: 'Number Theory', G: 'Geometry', C: 'Combinatorics' };

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(d => {
      setProfile(d);
    });
  }, []);

  const getTitle = (cat: string, totalXp: number): string => {
    try {
      const { getFullTitle, getLevelFromXp } = require('@/lib/xp');
      const level = getLevelFromXp(totalXp);
      return getFullTitle(cat, level);
    } catch { return 'Math Explorer'; }
  };

  return (
    <AuthGuard>
      <h1 className="text-2xl font-bold mb-6">My Progress</h1>
      {profile && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border">
            <p><strong>Username:</strong> {profile.username}</p>
          </div>
          <h2 className="text-lg font-semibold">Titles &amp; Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(profile.xp || {}).map(([cat, data]: [string, any]) => {
              const nextLvlXp = data.nextLevelXp || 100;
              const currentXp = data.currentXp || 0;
              const pct = nextLvlXp > 0 ? Math.min(100, (currentXp / nextLvlXp) * 100) : 0;
              const title = getTitle(cat, data.level || 1);
              return (
                <div key={cat} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-semibold text-sm text-gray-500">{catNames[cat]}</span>
                      <p className="text-lg font-bold text-gray-800">{title}</p>
                    </div>
                    <span className="text-sm text-gray-400">Lv.{data.level}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: pct + '%' }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{data.totalXp || 0} total XP &middot; {currentXp}/{nextLvlXp} to next</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
