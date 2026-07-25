export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id);
  const { hintNumber, useful, revealedAnswer } = await req.json();
  const sub = await prisma.submission.findFirst({ where: { problemId: parseInt(params.id), studentId: userId }, orderBy: { createdAt: 'desc' } });
  if (!sub) return NextResponse.json({ error: 'No submission' }, { status: 404 });
  await prisma.hintFeedback.create({ data: { submissionId: sub.id, hintNumber, useful, revealedAnswer } });
  if (useful) {
    const w = await prisma.wallet.findUnique({ where: { userId } });
    if (w) { await prisma.wallet.update({ where: { userId }, data: { balance: { increment: 5 } } }); }
  }
  return NextResponse.json({ ok: true });
}
