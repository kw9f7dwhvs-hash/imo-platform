export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id);
  const { perceivedStars, submittedHint } = await req.json();
  const sub = await prisma.submission.findFirst({ where: { problemId: parseInt(params.id), studentId: userId }, orderBy: { createdAt: 'desc' } });
  if (!sub) return NextResponse.json({ error: 'No submission' }, { status: 404 });
  await prisma.studentFeedback.upsert({
    where: { submissionId: sub.id },
    update: { perceivedStars, submittedHint },
    create: { submissionId: sub.id, perceivedStars, submittedHint },
  });
  if (submittedHint) {
    const problem = await prisma.problem.findUnique({ where: { id: parseInt(params.id) } });
    const hasHints = problem?.hint1Text || problem?.hint2Text || problem?.hint3Text;
    await prisma.hintPool.create({
      data: { problemId: parseInt(params.id), hintNumber: hasHints ? 0 : 1, hintText: submittedHint, status: hasHints ? 'standby' : 'active', submittedBy: userId },
    });
    if (!hasHints) await prisma.problem.update({ where: { id: parseInt(params.id) }, data: { hint1Text: submittedHint } });
  }
  return NextResponse.json({ ok: true });
}
