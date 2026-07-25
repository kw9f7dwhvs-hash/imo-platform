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
  const problem = await prisma.problem.findUnique({ where: { id: parseInt(params.id) } });
  if (!problem) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Build message body
  let body = '';
  if (perceivedStars) {
    body += 'Perceived difficulty: ' + '★'.repeat(perceivedStars) + '\n\n';
  }
  if (submittedHint) {
    body += 'Suggested hint:\n' + submittedHint + '\n\n';
  }
  body += '---\nProblem: ' + (problem?.title || '#' + params.id) + ' (ID: ' + params.id + ')' + '\nCategory: ' + (problem?.categoryId || '?') + ' | ★' + (problem?.difficultyId || '?');

  await prisma.message.create({
    data: {
      fromUserId: userId,
      toUserId: 1,
      subject: (perceivedStars ? '★'.repeat(perceivedStars) + ' ' : '') + (problem?.title || '#' + params.id) + ' ' + (submittedHint ? '[hint]' : '[rating]'),
      body: body,
      coins: 0,
    },
  });

  return NextResponse.json({ ok: true });
}
