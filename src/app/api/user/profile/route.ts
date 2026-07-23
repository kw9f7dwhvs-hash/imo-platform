import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getXpProgress } from '@/lib/xp';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  const userId = parseInt(user.id);

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { xpRecords: true },
  });

  if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const xp: Record<string, any> = {};
  for (const cat of ['A', 'N', 'G', 'C']) {
    const record = dbUser.xpRecords.find(r => r.categoryId === cat);
    const totalXp = record?.totalXp || 0;
    xp[cat] = { ...getXpProgress(totalXp), totalXp };
  }

  return NextResponse.json({ id: dbUser.id, username: dbUser.username, role: dbUser.role, xp });
}
