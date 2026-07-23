'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';

const catNames: Record<string, string> = { A: 'Algebra', N: 'Number Theory', G: 'Geometry', C: 'Combinatorics' };
const diffNames: Record<string, string> = { '1': '★1', '2': '★2', '3': '★3', '4': '★4', '5': '★5' };

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  needs_clarification: 'bg-blue-100 text-blue-700',
  needs_correction: 'bg-orange-100 text-orange-700',
  passed: 'bg-green-100 text-green-700',
  retry: 'bg-purple-100 text-purple-700',
  revealed: 'bg-red-100 text-red-700',
  answer_read: 'bg-gray-100 text-gray-500',
};

export default function AdminStatsPage() {
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [logFilter, setLogFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setData);
  }, []);

  const filteredSubs = (subs: any[]) => {
    if (logFilter === 'all') return subs;
    return subs.filter((s: any) => s.status === logFilter || s.grade === logFilter);
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Student Statistics</h1>

        <div className="flex gap-2 mb-4">
          {['all', 'pending', 'passed', 'revealed', 'answer_read', 'retry'].map(f => (
            <button key={f} onClick={() => setLogFilter(f)}
              className={'px-3 py-1 rounded-lg text-xs ' + (logFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600')}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {!data ? <p className="text-gray-400">Loading...</p> : data.students.length === 0 ? (
          <p className="text-gray-500">No students yet.</p>
        ) : (
          data.students.map((s: any) => (
            <div key={s.id} className="bg-white rounded-lg border overflow-hidden">
              {/* Student header */}
              <div className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                <div>
                  <span className="font-semibold text-lg">{s.username}</span>
                  <span className="text-sm text-gray-500 ml-3">
                    {s.totalAttempts} attempts · {s.passed} passed · {s.passRate}%
                  </span>
                </div>
                <span className="text-gray-400">{expanded === s.id ? '▲' : '▼'}</span>
              </div>

              {expanded === s.id && (
                <div className="p-4 space-y-4">
                  {/* By category */}
                  <div>
                    <h3 className="font-medium text-sm text-gray-600 mb-2">By Category</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['A', 'N', 'G', 'C'].map(cat => {
                        const cs = s.catStats[cat] || { total: 0, passed: 0, byDifficulty: {} };
                        const rate = cs.total > 0 ? Math.round((cs.passed / cs.total) * 100) : 0;
                        return (
                          <div key={cat} className="border rounded p-3 text-center">
                            <p className="font-medium text-sm">{catNames[cat]}</p>
                            <p className="text-2xl font-bold">{rate}%</p>
                            <p className="text-xs text-gray-500">{cs.passed}/{cs.total}</p>
                            <div className="mt-2 space-y-1">
                              {[1, 2, 3, 4, 5].map(d => {
                                const ds = cs.byDifficulty?.[String(d)];
                                if (!ds) return null;
                                const dr = ds.total > 0 ? Math.round((ds.passed / ds.total) * 100) : 0;
                                return (
                                  <div key={d} className="flex justify-between text-xs">
                                    <span className="text-gray-400">{diffNames[String(d)]}</span>
                                    <span>{dr}% ({ds.passed}/{ds.total})</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* XP */}
                  <div>
                    <h3 className="font-medium text-sm text-gray-600 mb-2">Experience Points</h3>
                    <div className="flex gap-4 text-sm">
                      {s.xpRecords?.map((xp: any) => (
                        <span key={xp.categoryId}>{catNames[xp.categoryId]}: Lv.{xp.level} ({xp.totalXp} XP)</span>
                      ))}
                      {(!s.xpRecords || s.xpRecords.length === 0) && <span className="text-gray-400">No XP earned yet</span>}
                    </div>
                  </div>

                  {/* Full submission log */}
                  <div>
                    <h3 className="font-medium text-sm text-gray-600 mb-2">
                      Complete Submission Log ({s.allSubmissions?.length || 0} entries)
                    </h3>
                    {s.allSubmissions && s.allSubmissions.length > 0 ? (
                      <div className="border rounded max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="text-left p-2 font-medium text-gray-600">Problem</th>
                              <th className="text-left p-2 font-medium text-gray-600">Category</th>
                              <th className="text-left p-2 font-medium text-gray-600">★</th>
                              <th className="text-left p-2 font-medium text-gray-600">Status</th>
                              <th className="text-left p-2 font-medium text-gray-600">Attempt</th>
                              <th className="text-left p-2 font-medium text-gray-600">Hints</th>
                              <th className="text-left p-2 font-medium text-gray-600">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSubs(s.allSubmissions).map((sub: any) => (
                              <tr key={sub.id} className="border-t hover:bg-gray-50">
                                <td className="p-2">{sub.problemTitle}</td>
                                <td className="p-2 text-xs">{catNames[sub.categoryId] || sub.categoryId}</td>
                                <td className="p-2 text-xs">{diffNames[String(sub.difficultyId)] || sub.difficultyId}</td>
                                <td className="p-2">
                                  <span className={'text-xs px-2 py-0.5 rounded-full ' + (statusBadge[sub.status] || 'bg-gray-100')}>
                                    {sub.status?.replace(/_/g, ' ') || sub.grade || '-'}
                                  </span>
                                </td>
                                <td className="p-2 text-xs">#{sub.attemptCount}</td>
                                <td className="p-2 text-xs">{sub.hintsUsed}/3</td>
                                <td className="p-2 text-xs text-gray-400">{new Date(sub.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No submissions yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AuthGuard>
  );
}
