import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  const studentId = parseInt(user.id);
  const problemId = parseInt(params.id);

  const sub = await prisma.submission.findFirst({
    where: { problemId, studentId },
    orderBy: { createdAt: 'desc' },
  });

  if (!sub) return NextResponse.json({ error: 'No submission found' }, { status: 404 });
  if (sub.status !== 'revealed' && sub.status !== 'answer_read') return NextResponse.json({ error: 'Answer not yet revealed' }, { status: 400 });

  await prisma.submission.update({
    where: { id: sub.id },
    data: { status: 'answer_read', answerReadAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
