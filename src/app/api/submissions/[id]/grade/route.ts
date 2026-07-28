import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateFinalXp } from '@/lib/xp';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { grade, feedback, score } = await req.json();
  const adminId = parseInt(user.id);
  const submissionId = parseInt(params.id);

  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { problem: true },
  });
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Prevent re-grading finalized submissions
  const finalStatuses = ['passed', 'revealed', 'answer_read'];
  if (finalStatuses.includes(sub.status)) {
    return NextResponse.json({ error: 'Cannot grade a submission that is already ' + sub.status }, { status: 400 });
  }

  let newStatus = sub.status;
  if (grade === 'pass') newStatus = 'passed';
  else if (grade === 'clarify') newStatus = 'needs_clarification';
  else if (grade === 'correct') newStatus = 'needs_correction';
  else if (grade === 'retry') newStatus = 'retry';

  await prisma.submission.update({
    where: { id: submissionId },
    data: { grade, status: newStatus, feedback: feedback || null, score: score ?? null, gradedAt: new Date(), gradedBy: adminId },
  });

  if (grade === 'pass') {
    const problem = sub.problem;
    const xp = calculateFinalXp(problem.difficultyId, sub.hintsUsed, sub.attemptCount === 1, score);
    const catId = problem.categoryId;
    const existing = await prisma.userXp.findUnique({
      where: { userId_categoryId: { userId: sub.studentId, categoryId: catId } },
    });
    if (existing) {
      const newTotal = existing.totalXp + xp;
      const newLevel = Math.floor(newTotal / 100) + 1;
      await prisma.userXp.update({ where: { id: existing.id }, data: { totalXp: newTotal, level: newLevel } });
    } else {
      await prisma.userXp.create({ data: { userId: sub.studentId, categoryId: catId, totalXp: xp, level: Math.floor(xp / 100) + 1 } });
    }
    await prisma.xpLog.create({
      data: {
        userId: sub.studentId, problemId: problem.id, categoryId: catId,
        baseXp: Math.round(calculateFinalXp(problem.difficultyId, 0, true)), hintMultiplier: sub.hintsUsed === 0 ? 1.0 : sub.hintsUsed === 1 ? 0.7 : sub.hintsUsed === 2 ? 0.4 : 0.1,
        firstAttempt: sub.attemptCount === 1, finalXp: xp,
      },
    });
  }


  return NextResponse.json({ ok: true, status: newStatus, grade });
}
