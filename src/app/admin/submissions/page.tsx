'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MathRenderer from '@/components/MathRenderer';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [grading, setGrading] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState<number>(7);

  const fetchSubmissions = async (status: string) => {
    setLoading(true);
    const r = await fetch('/api/admin/submissions?status=' + status);
    if (r.ok) setSubmissions(await r.json());
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(filter); }, [filter]);

  const handleGrade = async (id: number, grade: string, scoreVal: number) => {
    setGrading(id);
    const r = await fetch('/api/submissions/' + id + '/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade, feedback: feedback || null, score: grade === 'pass' ? scoreVal : undefined }),
    });
    if (r.ok) {
      setSubmissions(s => s.filter(x => x.id !== id));
      setFeedback('');
      setScore(7);
    }
    setGrading(null);
  };

  const handleUnpass = async (id: number) => {
    if (!confirm('Unpass this submission? Student XP will be removed and status reverted to Needs Clarification.')) return;
    setGrading(id);
    const r = await fetch('/api/submissions/' + id + '/unpass', { method: 'POST' });
    if (r.ok) {
      setSubmissions(s => s.filter(x => x.id !== id));
      setFeedback('');
    } else {
      const err = await r.json();
      alert(err.error || 'Unpass failed');
    }
    setGrading(null);
  };

  const canUnpass = (sub: any) => {
    if (!sub.gradedAt) return false;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return (now - new Date(sub.gradedAt).getTime()) < oneDay;
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Grade Submissions</h1>
        <div className="flex flex-wrap gap-2">
          {['pending', 'needs_clarification', 'needs_correction', 'retry', 'passed', 'revealed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={'px-3 py-1.5 rounded-lg text-sm ' + (filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {s === 'needs_clarification' ? 'Needs Clarification' : s === 'needs_correction' ? 'Needs Correction' : s.replace('_', ' ').replace(/^./, c => c.toUpperCase())}
            </button>
          ))}
        </div>
        {loading ? <p className="text-gray-400">Loading...</p> : submissions.length === 0 ? (() => {
          const displayName: Record<string,string> = { 'pending': 'Pending', 'needs_clarification': 'Needs Clarification', 'needs_correction': 'Needs Correction', 'retry': 'Retry', 'passed': 'Passed', 'revealed': 'Revealed' };
          return <p className="text-gray-500">No submissions with status: {displayName[filter] || filter}</p>;
        })() : (
          <div className="space-y-4">
            {submissions.map(sub => (
              <div key={sub.id} className="bg-white p-4 rounded-lg border space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{sub.problem?.title || 'Problem #' + sub.problemId}</p>
                    <p className="text-sm text-gray-500">
                      {sub.student?.username} | {sub.problem?.category?.displayNameCn || sub.problem?.categoryId} | {sub.problem?.difficultyTier?.name}
                      | Attempt #{sub.attemptCount} | Hints: {sub.hintsUsed}/3
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(sub.createdAt).toLocaleString()}</span>
                </div>

                {/* Show student's text solution */}
                {sub.solutionText && (
                  <div className="bg-gray-50 rounded p-3 border">
                    <p className="text-sm font-medium text-gray-500 mb-1">Student's solution:</p>
                    <MathRenderer content={sub.solutionText} />
                  </div>
                )}

                {/* Show student's image solution */}
                {sub.imagePath && (
                  <img src={sub.imagePath} alt="Submission" className="max-h-64 rounded border" />
                )}

                {/* Previous feedback display */}
                {sub.feedback && (
                  <div className="bg-blue-50 rounded p-2 border border-blue-200">
                    <p className="text-xs text-blue-500">Previous feedback:</p>
                    <p className="text-sm text-blue-700">{sub.feedback}</p>
                  </div>
                )}

                {/* Feedback input */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Feedback / Comments:</label>
                  <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Explain what needs to be clarified or corrected..." />
                </div>

                {/* Grade buttons */}
                {filter === 'pending' && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm text-gray-500">Score out of 7:</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5,6,7].map(s => (
                      <button key={s} onClick={() => setScore(s)}
                        className={'w-8 h-8 rounded text-sm font-medium ' + (score === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{s}</button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">(for Pass grade, XP = score/7 base)</span>
                </div>
                )}
                <div className="flex gap-2">
                  {filter === 'passed' && canUnpass(sub) && (
                    <button onClick={() => handleUnpass(sub.id)}
                      disabled={grading === sub.id}
                      className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm disabled:opacity-50 hover:bg-red-200">
                      {grading === sub.id ? '...' : 'Unpass'}
                    </button>
                  )}
                  {['pending', 'needs_clarification', 'needs_correction', 'retry'].includes(sub.status) && (
                  {[
                    { g: 'pass', label: 'Pass', cls: 'bg-green-600 hover:bg-green-700' },
                    { g: 'clarify', label: 'Clarify', cls: 'bg-blue-600 hover:bg-blue-700' },
                    { g: 'correct', label: 'Correct', cls: 'bg-orange-600 hover:bg-orange-700' },
                    { g: 'retry', label: 'Retry', cls: 'bg-purple-600 hover:bg-purple-700' },
                  ].map(btn => (
                    <button key={btn.g}
                      onClick={() => handleGrade(sub.id, btn.g, score)}
                      disabled={grading === sub.id}
                      className={'px-4 py-1.5 text-white rounded-lg text-sm disabled:opacity-50 ' + btn.cls}>
                      {grading === sub.id ? '...' : btn.label}
                    </button>
                  ))}
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
