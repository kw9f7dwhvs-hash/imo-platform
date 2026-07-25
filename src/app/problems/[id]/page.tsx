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
  const [wallet, setWallet] = useState<any>(null);
  const [showHintFeedback, setShowHintFeedback] = useState(false);
        
  const fetchProblem = useCallback(async () => {
    const r = await fetch('/api/problems/' + id);
    if (r.ok) setProblem(await r.json());
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchProblem();
    fetch('/api/user/wallet').then(r => r.json()).then(d => setWallet(d)).catch(() => {});
  }, [fetchProblem]);

  const handleSubmit = async () => {
    if (!selectedFile && !solutionText.trim()) { setMsg('Upload an image or write a solution'); return; }
    setSubmitting(true); setMsg('');
    const formData = new FormData();
    if (selectedFile) formData.append('file', selectedFile);
    if (solutionText.trim()) formData.append('text', solutionText);
    const r = await fetch('/api/problems/' + id + '/submit', { method: 'POST', body: formData });
    const data = await r.json();
    if (r.ok) { setMsg('Submitted! (-10 coins)'); setSolutionText(''); setSelectedFile(null); fetchProblem(); fetch('/api/user/wallet').then(r2 => r2.json()).then(d => setWallet(d)); }
    else setMsg(data.error || 'Submit failed');
    setSubmitting(false);
  };

  const handleHint = async () => {
    const r = await fetch('/api/problems/' + id + '/hint', { method: 'POST' });
    if (r.ok) {
      fetchProblem();
      fetch('/api/user/wallet').then(r2 => r2.json()).then(d => setWallet(d));
      const data = await r.json();
      if (data.status === 'revealed') setShowHintFeedback(true);
      else setShowHintFeedback(true);
    }
    else setMsg((await r.json()).error || 'Request failed');
  };

  

  

  if (loading) return <AuthGuard><p className="text-gray-400">Loading...</p></AuthGuard>;
  if (!problem) return <AuthGuard><p className="text-red-500">Problem not found</p></AuthGuard>;

  const sub = problem.submission;
  const isPassed = sub?.status === 'passed';
  const isRevealed = sub?.status === 'revealed';
  const isRead = sub?.status === 'answer_read';

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <p className="text-sm text-gray-500">
              {problem.category?.displayNameCn || problem.categoryId} | {problem.difficultyTier?.name || ('★' + problem.difficultyId)}
              {problem.difficultyTier && ' (' + problem.difficultyTier.xpValue + ' XP)'}
              {wallet && <span className="ml-4 text-amber-600">Wallet: {wallet.balance} coins</span>}
            </p>
          </div>
          {isPassed && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Passed!</span>}
        </div>

        {problem.problemText && <MathRenderer content={problem.problemText} className="bg-white p-4 rounded-lg border" />}
        {problem.problemImages?.map((img, i) => <img key={i} src={img} alt={'Problem ' + (i + 1)} className="w-full rounded-lg border" />)}

        {isRevealed && !isRead && (
          <div className="space-y-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <h2 className="font-semibold text-red-700 mb-2">Full Answer</h2>
              {problem.answerText && <MathRenderer content={problem.answerText} className="mb-2" />}
              {problem.answerImages?.map((img, i) => <img key={i} src={img} alt={'Answer ' + (i + 1)} className="max-h-96 rounded mb-2" />)}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-amber-700 mb-3">Please read the answer carefully.</p>
              <button onClick={async () => { await fetch('/api/problems/' + id + '/read-answer', { method: 'POST' }); setShowStudentFeedback(true); }} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Mark as Read</button>
            </div>
          </div>
        )}

        {/* Hint feedback */}
        {showHintFeedback && (
          <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm">Was this hint useful?</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 text-sm"><input type="radio" name="useful" checked={hintFeedback.useful} onChange={() => setHintFeedback(f => ({...f, useful: true}))} /> Useful</label>
              <label className="flex items-center gap-1 text-sm"><input type="radio" name="useful" checked={!hintFeedback.useful} onChange={() => setHintFeedback(f => ({...f, useful: false}))} /> Not useful</label>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hintFeedback.revealedAnswer} onChange={e => setHintFeedback(f => ({...f, revealedAnswer: e.target.checked}))} /> This hint fully revealed the answer</label>
            <button onClick={submitHintFeedback} disabled={submittingFeedback} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">{submittingFeedback ? '...' : 'Submit feedback'}</button>
          </div>
        )}

        {/* Student feedback after pass/reveal */}
        {showStudentFeedback && (
          <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm">Rate this problem</h3>
            <div>
              <p className="text-xs text-gray-500 mb-1">Actual difficulty you experienced (1-5 stars):</p>
              <div className="flex gap-1">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setStudentFeedback(f => ({...f, perceivedStars: s}))} className={'text-lg ' + (s <= studentFeedback.perceivedStars ? 'text-amber-400' : 'text-gray-300')}>★</button>)}</div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Submit a hint (optional):</p>
              <textarea value={studentFeedback.submittedHint} onChange={e => setStudentFeedback(f => ({...f, submittedHint: e.target.value}))} rows={2} className="w-full px-3 py-2 border rounded text-sm" placeholder="Your suggested hint..." />
            </div>
            <div className="flex gap-2">
              <button onClick={submitStudentFeedback} disabled={submittingFeedback} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">{submittingFeedback ? '...' : 'Submit'}</button>
              <button onClick={() => { setShowStudentFeedback(false); router.push('/problems'); }} className="px-3 py-1 bg-gray-200 rounded text-sm">Skip</button>
            </div>
          </div>
        )}

        {!isPassed && !isRevealed && !isRead && (
          <>
            <div className="bg-white p-4 rounded-lg border space-y-3">
              <h2 className="font-semibold">Submit Your Solution {wallet && <span className="text-xs text-gray-400 font-normal">(cost: 10 coins · balance: {wallet.balance})</span>}</h2>
              <div><label className="block text-sm text-gray-500 mb-1">Write your solution (supports LaTeX with $...$)</label>
                <textarea value={solutionText} onChange={e => setSolutionText(e.target.value)} rows={5} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="We prove that $n=1$ is the only solution..." /></div>
              <div><label className="block text-sm text-gray-500 mb-1">Or upload an image</label>
                <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="block w-full text-sm" /></div>
              {selectedFile && <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="max-h-48 rounded border" />}
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit'}</button>
              {msg && <p className={'text-sm ' + (msg.includes('fail') || msg.includes('Upload') ? 'text-red-500' : 'text-green-600')}>{msg}</p>}
              {sub?.feedback && <div className="bg-blue-50 border border-blue-200 rounded p-3"><p className="text-sm font-medium text-blue-700 mb-1">Teacher feedback:</p><p className="text-sm text-blue-600">{sub.feedback}</p></div>}
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h2 className="font-semibold mb-2">Help</h2>
              <HintPanel hintsUsed={sub?.hintsUsed || 0} hint1Image={problem.hint1Image} hint1Text={problem.hint1Text}
                hint2Image={problem.hint2Image} hint2Text={problem.hint2Text} hint3Image={problem.hint3Image} hint3Text={problem.hint3Text}
                answerImages={problem.answerImages || []} answerText={problem.answerText}
                onRequestHint={handleHint} disabled={submitting} isRevealed={false} status={sub?.status || ''} />
            </div>
          </>
        )}

        {sub && sub.status !== 'pending' && !isPassed && !isRevealed && !isRead && (
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="font-semibold mb-2">Submission Status</h2>
            <p className="text-sm">Attempt #{sub.attemptCount} | {sub.grade || 'Pending'} | Hints: {sub.hintsUsed}/3</p>
            {sub.feedback && <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2"><p className="text-sm text-blue-600">{sub.feedback}</p></div>}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
