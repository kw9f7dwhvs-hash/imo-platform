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
    // Deduct 50% of current balance
    const wall = await prisma.wallet.findUnique({ where: { userId: studentId } });
    if (wall && wall.balance > 0) {
      const deduct = Math.max(1, Math.round(wall.balance * 0.5));
      await prisma.wallet.update({ where: { userId: studentId }, data: { balance: { decrement: deduct } } });
      await prisma.transaction.create({ data: { userId: studentId, amount: -deduct, reason: "reveal", message: "Answer revealed - 50% deduction" } });
    }
    return NextResponse.json({ status: 'revealed', hintsUsed: sub.hintsUsed + 1 });
  }

  // Give next hint
  const updated = await prisma.submission.update({
    where: { id: sub.id },
    data: { hintsUsed: { increment: 1 } },
  });

  return NextResponse.json({ status: 'hint_given', hintsUsed: updated.hintsUsed });
}
