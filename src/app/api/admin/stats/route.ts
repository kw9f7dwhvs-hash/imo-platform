import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const students = await prisma.user.findMany({
    where: { role: 'student' },
    include: {
      submissions: {
        include: { problem: { select: { categoryId: true, difficultyId: true, title: true } } },
        orderBy: { createdAt: 'desc' },
      },
      xpRecords: true,
    },
  });

  const result = students.map(s => {
    const subs = s.submissions;
    const totalAttempts = subs.length;
    const passed = subs.filter(x => x.grade === 'pass').length;

    const catStats: Record<string, any> = {};
    const diffStats: Record<string, any> = {};

    for (const sub of subs) {
      const c = sub.problem.categoryId;
      const d = String(sub.problem.difficultyId);
      if (!catStats[c]) catStats[c] = { total: 0, passed: 0, byDifficulty: {} };
      catStats[c].total++;
      if (sub.grade === 'pass') catStats[c].passed++;
      if (!catStats[c].byDifficulty[d]) catStats[c].byDifficulty[d] = { total: 0, passed: 0 };
      catStats[c].byDifficulty[d].total++;
      if (sub.grade === 'pass') catStats[c].byDifficulty[d].passed++;

      if (!diffStats[d]) diffStats[d] = { total: 0, passed: 0 };
      diffStats[d].total++;
      if (sub.grade === 'pass') diffStats[d].passed++;
    }

    return {
      id: s.id,
      username: s.username,
      totalAttempts,
      passed,
      passRate: totalAttempts > 0 ? Math.round((passed / totalAttempts) * 100) : 0,
      catStats,
      diffStats,
      xpRecords: s.xpRecords,
      allSubmissions: subs.map(sub => ({
        id: sub.id,
        problemTitle: sub.problem.title,
        categoryId: sub.problem.categoryId,
        difficultyId: sub.problem.difficultyId,
        grade: sub.grade,
        status: sub.status,
        createdAt: sub.createdAt,
        attemptCount: sub.attemptCount,
        hintsUsed: sub.hintsUsed,
      })),
    };
  });

  return NextResponse.json({ students: result });
}
