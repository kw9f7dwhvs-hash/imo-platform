import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // PDF upload requires pdfjs-dist on the server
  // For now, return a placeholder - actual PDF processing will split pages into images
  return NextResponse.json({ message: 'PDF upload endpoint ready. Full processing requires pdfjs-dist integration.', pages: [] });
}
