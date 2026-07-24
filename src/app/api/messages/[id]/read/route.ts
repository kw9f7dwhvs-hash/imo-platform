import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id);
  const msgId = parseInt(params.id);

  const msg = await prisma.message.findUnique({ where: { id: msgId } });
  if (!msg || msg.toUserId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.message.update({ where: { id: msgId }, data: { readAt: new Date() } });
  return NextResponse.json({ ok: true });
}
