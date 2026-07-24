import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  const studentId = parseInt(user.id);
  if (user.role === 'admin') return NextResponse.json([]);

  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const difficultyMin = url.searchParams.get('difficultyMin');
  const difficultyMax = url.searchParams.get('difficultyMax');
  const history = url.searchParams.get('history') === 'true';

  if (history) {
    const doneSubs = await prisma.submission.findMany({
      where: { studentId, status: { in: ['passed', 'answer_read', 'revealed'] } },
      include: { problem: { include: { category: true, difficultyTier: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({
      problems: doneSubs.map((sub: any) => ({
        id: sub.problem.id, title: sub.problem.title,
        categoryId: sub.problem.categoryId, difficultyId: sub.problem.difficultyId,
        category: sub.problem.category, difficultyTier: sub.problem.difficultyTier,
        problemText: sub.problem.problemText,
        answerText: sub.problem.answerText,
        submission: { id: sub.id, status: sub.status, grade: sub.grade, hintsUsed: sub.hintsUsed, attemptCount: sub.attemptCount },
      })),
      total: doneSubs.length,
    });
  }

  // Get the LATEST submission per problem, then filter active ones
  const latestSubs = await prisma.submission.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  });
  // Keep only the latest submission per problem
  const latestPerProblem = new Map();
  for (const sub of latestSubs) {
    if (!latestPerProblem.has(sub.problemId)) {
      latestPerProblem.set(sub.problemId, sub);
    }
  }
  const activeSubs = Array.from(latestPerProblem.values()).filter(
    s => s.status !== 'passed' && s.status !== 'answer_read'
  );

  const activeProblemIds = new Set(activeSubs.map((s: any) => s.problemId));
  // Count unique active problem IDs (not submission rows, since one problem can have multiple submissions)
  const activeNonRevealed = new Set(activeSubs.filter((s: any) => s.status !== 'revealed').map((s: any) => s.problemId));
  const activeCount = activeNonRevealed.size;
  const revealedUnreadCount = activeSubs.filter((s: any) => s.status === 'revealed').length;
  const slotsLeft = 2 - activeCount;

  // Build query for problems
  const where: any = {};
  if (category) where.categoryId = category;
  if (difficultyMin || difficultyMax) {
    if (!where.difficultyId) where.difficultyId = {};
    if (difficultyMin) where.difficultyId.gte = parseInt(difficultyMin);
    if (difficultyMax) where.difficultyId.lte = parseInt(difficultyMax);
  }

  // Get currently active problems (submitted but not finished)
  const activeProblems = await prisma.problem.findMany({
    where: { ...where, id: { in: Array.from(activeProblemIds) } },
    include: { category: true, difficultyTier: true, submissions: { where: { studentId }, orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });

  // Get all problem IDs the student has ever submitted to (to avoid showing them again)
  const allStudentSubIds = await prisma.submission.findMany({
    where: { studentId },
    select: { problemId: true },
    distinct: ['problemId'],
  });
  const allDoneIds = new Set(allStudentSubIds.map((s: any) => s.problemId));

  // Get new problems to fill slots (excluding any the student has ever submitted to)
  let newProblems: any[] = [];
  if (slotsLeft > 0) {
    newProblems = await prisma.problem.findMany({
      where: {
        ...where,
        id: { notIn: Array.from(allDoneIds) },
      },
      include: { category: true, difficultyTier: true, submissions: { where: { studentId }, orderBy: { createdAt: 'desc' }, take: 1 } },
      take: slotsLeft,
      orderBy: { createdAt: 'desc' },
    });
  }

  const all = [...activeProblems, ...newProblems].slice(0, 2);

  const result = all.map((p: any) => {
    const sub = p.submissions[0] || null;
    return {
      id: p.id, title: p.title, categoryId: p.categoryId, difficultyId: p.difficultyId,
      category: p.category, difficultyTier: p.difficultyTier,
      problemImages: JSON.parse(p.problemImages || '[]'),
      problemText: p.problemText,
      hint1Image: p.hint1Image, hint1Text: p.hint1Text,
      hint2Image: p.hint2Image, hint2Text: p.hint2Text,
      hint3Image: p.hint3Image, hint3Text: p.hint3Text,
      answerImages: JSON.parse(p.answerImages || '[]'),
      answerText: p.answerText,
      createdAt: p.createdAt.toISOString(),
      submission: sub ? { id: sub.id, status: sub.status, hintsUsed: sub.hintsUsed, grade: sub.grade, attemptCount: sub.attemptCount, feedback: sub.feedback, answerReadAt: sub.answerReadAt } : null,
    };
  });

  return NextResponse.json({ problems: result, activeCount, revealedUnreadCount, slotsLeft });
}
