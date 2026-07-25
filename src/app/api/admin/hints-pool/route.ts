export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const pool = await prisma.hintPool.findMany({
      include: { problem: { select: { id: true, title: true } }, submitter: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(pool);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { poolId, action } = await req.json();
    const entry = await prisma.hintPool.findUnique({ where: { id: poolId } });
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (action === 'delete') {
      await prisma.hintPool.delete({ where: { id: poolId } });
    } else if (action === 'approve') {
      await prisma.hintPool.update({ where: { id: poolId }, data: { status: 'active' } });
      const problem = await prisma.problem.findUnique({ where: { id: entry.problemId } });
      if (!problem?.hint1Text) await prisma.problem.update({ where: { id: entry.problemId }, data: { hint1Text: entry.hintText } });
      else if (!problem?.hint2Text) await prisma.problem.update({ where: { id: entry.problemId }, data: { hint2Text: entry.hintText } });
      else if (!problem?.hint3Text) await prisma.problem.update({ where: { id: entry.problemId }, data: { hint3Text: entry.hintText } });
      else { await prisma.problem.update({ where: { id: entry.problemId }, data: { hint3Text: entry.hintText } }); }
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { poolId } = await req.json();
    await prisma.hintPool.delete({ where: { id: poolId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
