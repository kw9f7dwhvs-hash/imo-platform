import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = session.user as any;
  if (admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const transactions = await prisma.transaction.findMany({
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(transactions);
}
