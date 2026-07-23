'use client';
import { useState } from 'react';
import MathRenderer from '@/components/MathRenderer';

interface Props {
  hintsUsed: number;
  hint1Image: string | null; hint1Text?: string | null;
  hint2Image: string | null; hint2Text?: string | null;
  hint3Image: string | null; hint3Text?: string | null;
  answerImages: string[]; answerText?: string | null;
  onRequestHint: () => Promise<void>; disabled: boolean; isRevealed: boolean; status: string;
}
export default function HintPanel({
  hintsUsed, hint1Image, hint1Text, hint2Image, hint2Text, hint3Image, hint3Text,
  answerImages, answerText, onRequestHint, disabled, isRevealed, status
}: Props) {
  const [loading, setLoading] = useState(false);
  if (status === 'passed') return <div className="bg-green-50 border border-green-200 rounded p-3 text-green-700 text-sm">Done!</div>;
  const handleClick = async () => { setLoading(true); try { await onRequestHint(); } finally { setLoading(false); } };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Remaining hints: {3 - hintsUsed}</span>
        {hintsUsed < 3 && !isRevealed && (
          <button onClick={handleClick} disabled={loading || disabled}
            className="px-4 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50 text-sm">
            {loading ? '...' : 'Hint'}
          </button>
        )}
        {hintsUsed >= 3 && !isRevealed && (
          <button onClick={handleClick} disabled={loading || disabled}
            className="px-4 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 text-sm">
            {loading ? '...' : 'Reveal Answer'}
          </button>
        )}
      </div>
      {hintsUsed >= 1 && (
        <div className="border rounded p-3">
          <p className="text-sm font-medium text-gray-500 mb-1">Hint 1</p>
          {hint1Text && <MathRenderer content={hint1Text} />}
          {hint1Image && <img src={hint1Image} className="max-h-48 rounded mt-2" />}
        </div>
      )}
      {hintsUsed >= 2 && (
        <div className="border rounded p-3">
          <p className="text-sm font-medium text-gray-500 mb-1">Hint 2</p>
          {hint2Text && <MathRenderer content={hint2Text} />}
          {hint2Image && <img src={hint2Image} className="max-h-48 rounded mt-2" />}
        </div>
      )}
      {hintsUsed >= 3 && (
        <div className="border rounded p-3">
          <p className="text-sm font-medium text-gray-500 mb-1">Hint 3</p>
          {hint3Text && <MathRenderer content={hint3Text} />}
          {hint3Image && <img src={hint3Image} className="max-h-48 rounded mt-2" />}
        </div>
      )}
      {(isRevealed || hintsUsed > 3) && (
        <div className="border-2 border-red-200 rounded p-3 bg-red-50">
          <p className="text-sm font-medium text-red-600 mb-1">Full Answer</p>
          {answerText && <MathRenderer content={answerText} />}
          {answerImages.map((img, i) => <img key={i} src={img} alt={'Answer ' + (i + 1)} className="max-h-96 rounded mb-2 mt-2" />)}
        </div>
      )}
    </div>
  );
}
