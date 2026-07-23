import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  const studentId = parseInt(user.id);
  const problemId = parseInt(params.id);

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { category: true, difficultyTier: true,
      submissions: { where: { studentId }, orderBy: { createdAt: 'desc' }, take: 1 }
    },
  });

  if (!problem) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const sub = problem.submissions[0] || null;

  return NextResponse.json({
    id: problem.id, title: problem.title, categoryId: problem.categoryId, difficultyId: problem.difficultyId,
    category: problem.category, difficultyTier: problem.difficultyTier,
    problemImages: JSON.parse(problem.problemImages || '[]'),
    problemText: problem.problemText,
    hint1Image: problem.hint1Image, hint1Text: problem.hint1Text,
    hint2Image: problem.hint2Image, hint2Text: problem.hint2Text,
    hint3Image: problem.hint3Image, hint3Text: problem.hint3Text,
    answerImages: JSON.parse(problem.answerImages || '[]'),
    answerText: problem.answerText,
    createdAt: problem.createdAt.toISOString(),
    submission: sub ? {
      id: sub.id, status: sub.status, hintsUsed: sub.hintsUsed,
      grade: sub.grade, attemptCount: sub.attemptCount,
      feedback: sub.feedback, answerReadAt: sub.answerReadAt,
      solutionText: sub.solutionText, imagePath: sub.imagePath,
    } : null,
  });
}
