import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { username, password, role } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return NextResponse.json({ error: 'Username exists' }, { status: 409 });
  
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, passwordHash, role: role || 'student' },
    select: { id: true, username: true, role: true },
  });
  // Create wallet
  await prisma.wallet.create({ data: { userId: user.id, balance: 100 } });
  return NextResponse.json(user, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await req.json();
  if (id === parseInt((session.user as any).id)) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }
  await prisma.transaction.deleteMany({ where: { userId: id } });
  await prisma.xpLog.deleteMany({ where: { userId: id } });
  await prisma.userXp.deleteMany({ where: { userId: id } });
  await prisma.submission.deleteMany({ where: { studentId: id } });
  await prisma.redo.deleteMany({ where: { studentId: id } });
  await prisma.wallet.delete({ where: { userId: id } });
  await prisma.message.deleteMany({ where: { OR: [{ fromUserId: id }, { toUserId: id }] } });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
