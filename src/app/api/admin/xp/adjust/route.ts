import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
  const { userId, categoryId, amount } = await req.json();
  if (!userId || !categoryId || amount === undefined || amount === 0) {
    return NextResponse.json({ error: 'userId, categoryId, and non-zero amount required' }, { status: 400 });
  }

  const existing = await prisma.userXp.findUnique({
    where: { userId_categoryId: { userId, categoryId } },
  });

  if (existing) {
    const newTotal = Math.max(0, existing.totalXp + amount);
    const newLevel = Math.floor(newTotal / 100) + 1;
    await prisma.userXp.update({
      where: { id: existing.id },
      data: { totalXp: newTotal, level: newLevel },
    });
  } else if (amount > 0) {
    const newTotal = Math.max(0, amount);
    const newLevel = Math.floor(newTotal / 100) + 1;
    await prisma.userXp.create({
      data: { userId, categoryId, totalXp: newTotal, level: newLevel },
    });
  }

  return NextResponse.json({ ok: true, adjusted: amount });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
