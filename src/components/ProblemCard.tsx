'use client';
import Link from 'next/link';
interface Props { id: number; title: string; categoryName: string; difficultyName: string; status?: string; hintsUsed?: number; }
const sl: Record<string, string> = { pending: 'text-yellow-700 bg-yellow-100', needs_clarification: 'text-blue-700 bg-blue-100', needs_correction: 'text-orange-700 bg-orange-100', passed: 'text-green-700 bg-green-100', retry: 'text-purple-700 bg-purple-100', revealed: 'text-red-700 bg-red-100' };
const sn: Record<string, string> = { pending: 'Pending', needs_clarification: 'Clarify', needs_correction: 'Correct', passed: 'Passed', retry: 'Retry', revealed: 'Revealed' };
export default function ProblemCard({ id, title, categoryName, difficultyName, status, hintsUsed }: Props) {
  return (
    <Link href={'/problems/' + id} className="block bg-white rounded-lg border hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium truncate flex-1">{title}</h3>
        {status && <span className={'text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ' + (sl[status] || '')}>{sn[status] || status}</span>}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{categoryName}</span>
        <span>{difficultyName}</span>
        {hintsUsed !== undefined && hintsUsed > 0 && <span className="text-amber-500">Hints: {hintsUsed}/3</span>}
      </div>
    </Link>
  );
}
