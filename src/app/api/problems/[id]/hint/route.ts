import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { scheduleRedo } from '@/lib/redo';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  const studentId = parseInt(user.id);
  const problemId = parseInt(params.id);

  let sub = await prisma.submission.findFirst({
    where: { problemId, studentId },
    orderBy: { createdAt: 'desc' },
  });

  if (!sub) {
    // Create a submission record if none exists
    sub = await prisma.submission.create({
      data: { problemId, studentId, status: 'hint_requested', hintsUsed: 0 },
    });
  }

  if (sub.hintsUsed >= 3) {
    // Reveal answer
    await prisma.submission.update({
      where: { id: sub.id },
      data: { status: 'revealed', hintsUsed: sub.hintsUsed + 1 },
    });
    await scheduleRedo(problemId, studentId);
    return NextResponse.json({ status: 'revealed', hintsUsed: sub.hintsUsed + 1 });
  }

  // Give next hint
  const updated = await prisma.submission.update({
    where: { id: sub.id },
    data: { hintsUsed: { increment: 1 } },
  });

  return NextResponse.json({ status: 'hint_given', hintsUsed: updated.hintsUsed });
}
