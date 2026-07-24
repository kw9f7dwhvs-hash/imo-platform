import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id);
  const url = new URL(req.url);
  const box = url.searchParams.get('box') || 'inbox';

  const messages = await prisma.message.findMany({
    where: box === 'inbox' ? { toUserId: userId } : { fromUserId: userId },
    include: {
      fromUser: { select: { id: true, username: true, role: true } },
      toUser: { select: { id: true, username: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(messages);
}
