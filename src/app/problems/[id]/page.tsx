'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import HintPanel from '@/components/HintPanel';
import MathRenderer from '@/components/MathRenderer';
import { useRouter } from 'next/navigation';

export default function ProblemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [solutionText, setSolutionText] = useState('');
  const [msg, setMsg] = useState('');

  const fetchProblem = useCallback(async () => {
    const r = await fetch('/api/problems/' + id);
    if (r.ok) setProblem(await r.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchProblem(); }, [fetchProblem]);

  const handleSubmit = async () => {
    if (!selectedFile && !solutionText.trim()) { setMsg('Upload an image or write a solution'); return; }
    setSubmitting(true); setMsg('');
    const formData = new FormData();
    if (selectedFile) formData.append('file', selectedFile);
    if (solutionText.trim()) formData.append('text', solutionText);
    const r = await fetch('/api/problems/' + id + '/submit', { method: 'POST', body: formData });
    const data = await r.json();
    if (r.ok) { setMsg('Submitted!'); setSolutionText(''); setSelectedFile(null); fetchProblem(); }
    else setMsg(data.error || 'Submit failed');
    setSubmitting(false);
  };

  const handleHint = async () => {
    const r = await fetch('/api/problems/' + id + '/hint', { method: 'POST' });
    if (r.ok) fetchProblem();
    else setMsg((await r.json()).error || 'Request failed');
  };

  const handleMarkRead = async () => {
    const r = await fetch('/api/problems/' + id + '/read-answer', { method: 'POST' });
    if (r.ok) {
      setMsg('Answer marked as read!');
      setTimeout(() => window.location.href = '/problems', 1000);
    }
  };

  if (loading) return <AuthGuard><p className="text-gray-400">Loading...</p></AuthGuard>;
  if (!problem) return <AuthGuard><p className="text-red-500">Problem not found</p></AuthGuard>;

  const sub = problem.submission;
  const isPassed = sub?.status === 'passed';
  const isRevealed = sub?.status === 'revealed' || sub?.status === 'answer_read';
  const isRead = sub?.status === 'answer_read';

  // If already read, redirect to problems list
  // (handled at render level: show a brief message then redirect)

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <p className="text-sm text-gray-500">
              {problem.category?.displayNameCn || problem.categoryId} | {problem.difficultyTier?.name || ('★' + problem.difficultyId)}
              {problem.difficultyTier && ' (' + problem.difficultyTier.xpValue + ' XP)'}
            </p>
          </div>
          {isPassed && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Passed!</span>}
        </div>

        {problem.problemText && <MathRenderer content={problem.problemText} className="bg-white p-4 rounded-lg border" />}
        {problem.problemImages?.map((img: string, i: number) => (
          <img key={i} src={img} alt={'Problem ' + (i + 1)} className="w-full rounded-lg border" />
        ))}

        {/* Show answer when revealed - mark as read button only for unread */}
        {(sub?.status === 'revealed') && (
          <div className="space-y-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <h2 className="font-semibold text-red-700 mb-2">Full Answer</h2>
              {problem.answerText && <MathRenderer content={problem.answerText} className="mb-2" />}
              {problem.answerImages?.map((img: string, i: number) => (
                <img key={i} src={img} alt={'Answer ' + (i + 1)} className="max-h-96 rounded mb-2" />
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-amber-700 mb-3">Please read the answer carefully. Once you mark it as read, this problem will be removed from your active list.</p>
              <button onClick={handleMarkRead} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Mark as Read
              </button>
            </div>
          </div>
        )}

        {/* Normal submission flow (not revealed, not passed) */}
        {!isPassed && !isRevealed && (
          <>
            <div className="bg-white p-4 rounded-lg border space-y-3">
              <h2 className="font-semibold">Submit Your Solution</h2>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Write your solution (supports LaTeX with $...$)</label>
                <textarea value={solutionText} onChange={e => setSolutionText(e.target.value)} rows={5}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="We prove that $n=1$ is the only solution..." />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Or upload an image</label>
                <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
              </div>
              {selectedFile && <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="max-h-48 rounded border" />}
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
              {msg && <p className={'text-sm ' + (msg.includes('fail') || msg.includes('Upload') ? 'text-red-500' : 'text-green-600')}>{msg}</p>}
              {sub?.feedback && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm font-medium text-blue-700 mb-1">Teacher feedback:</p>
                  <p className="text-sm text-blue-600">{sub.feedback}</p>
                </div>
              )}
              {sub && (sub.status === 'needs_clarification' || sub.status === 'needs_correction') && (
                <p className="text-sm text-amber-600">{sub.status === 'needs_clarification' ? 'Needs clarification.' : 'Needs correction.'} Please revise and resubmit.</p>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h2 className="font-semibold mb-2">Help</h2>
              <HintPanel
                hintsUsed={sub?.hintsUsed || 0}
                hint1Image={problem.hint1Image} hint1Text={problem.hint1Text}
                hint2Image={problem.hint2Image} hint2Text={problem.hint2Text}
                hint3Image={problem.hint3Image} hint3Text={problem.hint3Text}
                answerImages={problem.answerImages || []} answerText={problem.answerText}
                onRequestHint={handleHint}
                disabled={submitting} isRevealed={false} status={sub?.status || ''}
              />
            </div>
          </>
        )}

        {/* Already read — redirect notice */}
        {sub?.status === 'answer_read' && (
          <div className="bg-gray-50 border rounded-lg p-6 text-center">
            <p className="text-gray-500 mb-4">You have already read the answer for this problem.</p>
            <button onClick={() => router.push('/problems')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Back to Problems
            </button>
          </div>
        )}

        {sub && sub.status !== 'pending' && !isPassed && !isRevealed && (
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="font-semibold mb-2">Submission Status</h2>
            <p className="text-sm">Attempt #{sub.attemptCount} | Grade: {sub.grade || 'Pending'} | Hints: {sub.hintsUsed}/3</p>
            {sub.feedback && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                <p className="text-sm font-medium text-blue-700">Teacher feedback:</p>
                <p className="text-sm text-blue-600">{sub.feedback}</p>
              </div>
            )}
            {sub.grade === 'retry' && <p className="text-sm text-purple-600 mt-1">Will reappear in 2 weeks for retry.</p>}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
