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


  // Coin refund logic
  const w = await prisma.wallet.findUnique({ where: { userId: sub.studentId } });
  if (w) {
    let refund = 0;
    if (grade === "clarify") refund = 10;      // Full refund
    else if (grade === "correct") refund = Math.round(10 * 0.8); // 80% back
    // 'pass': keep all coins (no refund)
    if (refund > 0) {
      await prisma.wallet.update({ where: { userId: sub.studentId }, data: { balance: { increment: refund } } });
      await prisma.transaction.create({ data: { userId: sub.studentId, amount: refund, reason: "grade_refund", message: "Refund: " + grade, adminId } });
    }
  }
  return NextResponse.json({ ok: true, status: newStatus, grade });
}
