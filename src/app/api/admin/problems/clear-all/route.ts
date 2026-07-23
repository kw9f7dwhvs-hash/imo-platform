import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.xpLog.deleteMany();
  await prisma.redo.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.userXp.deleteMany();
  await prisma.problem.deleteMany();

  return NextResponse.json({ ok: true });
}
