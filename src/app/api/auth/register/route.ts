import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password || username.length < 2 || password.length < 4) {
      return NextResponse.json({ error: 'Username min 2 chars, password min 4 chars' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return NextResponse.json({ error: 'Username taken' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, passwordHash, role: 'student' } });
    return NextResponse.json({ id: user.id, username: user.username, role: user.role });
  } catch { return NextResponse.json({ error: 'Register failed' }, { status: 500 }); }
}
