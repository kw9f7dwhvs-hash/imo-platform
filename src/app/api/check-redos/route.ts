import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkAndTriggerRedos } from '@/lib/redo';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  const studentId = parseInt(user.id);
  const count = await checkAndTriggerRedos(studentId);
  return NextResponse.json({ redosTriggered: count });
}
