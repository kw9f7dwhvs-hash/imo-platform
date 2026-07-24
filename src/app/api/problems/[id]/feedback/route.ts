import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id);
  const problemId = parseInt(params.id);
  const { perceivedStars, submittedHint } = await req.json();

  const sub = await prisma.submission.findFirst({ where: { problemId, studentId: userId }, orderBy: { createdAt: 'desc' } });
  if (!sub) return NextResponse.json({ error: 'No submission' }, { status: 404 });

  await prisma.studentFeedback.upsert({
    where: { submissionId: sub.id },
    update: { perceivedStars, submittedHint },
    create: { submissionId: sub.id, perceivedStars, submittedHint },
  });

  // If hint submitted, add to hints pool
  if (submittedHint) {
    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    const hasHints = problem?.hint1Text || problem?.hint2Text || problem?.hint3Text;
    await prisma.hintPool.create({
      data: {
        problemId, hintNumber: hasHints ? 0 : 1, hintText: submittedHint,
        status: hasHints ? 'standby' : 'active', submittedBy: userId,
      },
    });
    // If no existing hints, auto-add to hint1
    if (!hasHints) {
      await prisma.problem.update({ where: { id: problemId }, data: { hint1Text: submittedHint } });
    }
  }
  return NextResponse.json({ ok: true });
}