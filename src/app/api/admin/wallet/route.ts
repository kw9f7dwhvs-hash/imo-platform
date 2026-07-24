import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = session.user as any;
  if (admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, amount, message } = await req.json();
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await prisma.wallet.update({
    where: { userId },
    data: { balance: { increment: amount } },
  });
  await prisma.transaction.create({
    data: { userId, amount, reason: 'admin', message: message || null, adminId: parseInt(admin.id) },
  });

  return NextResponse.json({ ok: true, newBalance: wallet.balance + amount });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = session.user as any;
  if (admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const wallets = await prisma.wallet.findMany({
    include: { user: { select: { id: true, username: true, role: true } } },
    orderBy: { balance: 'desc' },
  });
  return NextResponse.json(wallets);
}
