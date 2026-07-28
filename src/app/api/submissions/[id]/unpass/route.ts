import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const submissionId = parseInt(params.id);

  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { problem: true },
  });
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (sub.status !== 'passed') return NextResponse.json({ error: 'Submission is not in passed status' }, { status: 400 });

  // Check if within 1 day
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (!sub.gradedAt || sub.gradedAt < oneDayAgo) {
    return NextResponse.json({ error: 'Cannot unpass: more than 1 day has passed since grading' }, { status: 400 });
  }

  // Find and remove the XP log for this submission
  const xpLog = await prisma.xpLog.findFirst({
    where: { userId: sub.studentId, problemId: sub.problemId, createdAt: { gte: sub.gradedAt } },
    orderBy: { createdAt: 'desc' },
  });

  if (xpLog) {
    // Subtract XP from userXp
    const catId = sub.problem.categoryId;
    const existing = await prisma.userXp.findUnique({
      where: { userId_categoryId: { userId: sub.studentId, categoryId: catId } },
    });
    if (existing) {
      const newTotal = Math.max(0, existing.totalXp - xpLog.finalXp);
      const newLevel = Math.floor(newTotal / 100) + 1;
      await prisma.userXp.update({
        where: { id: existing.id },
        data: { totalXp: newTotal, level: newLevel },
      });
    }
    // Delete XP log
    await prisma.xpLog.delete({ where: { id: xpLog.id } });
  }

  // Reset submission status
  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: 'needs_clarification',
      grade: null,
      score: null,
      feedback: null,
      gradedAt: null,
      gradedBy: null,
    },
  });

  return NextResponse.json({ ok: true });
}
