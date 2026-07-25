import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const adminId = parseInt(user.id);

  const formData = await req.formData();
  const configs = JSON.parse(formData.get('configs') as string);

  const results: any[] = [];
  for (const cfg of configs) {
    const problemImages: string[] = [];
    for (const fname of cfg.problemFiles || []) {
      const f = formData.get(fname) as File;
      if (f) problemImages.push(await saveUploadedFile(f, 'problems'));
    }

    let hint1: string|null = null, hint2: string|null = null, hint3: string|null = null;
    if (cfg.hint1File) { const f = formData.get(cfg.hint1File) as File; if (f) hint1 = await saveUploadedFile(f, 'hints'); }
    if (cfg.hint2File) { const f = formData.get(cfg.hint2File) as File; if (f) hint2 = await saveUploadedFile(f, 'hints'); }
    if (cfg.hint3File) { const f = formData.get(cfg.hint3File) as File; if (f) hint3 = await saveUploadedFile(f, 'hints'); }

    const answerImages: string[] = [];
    for (const fname of cfg.answerFiles || []) {
      const f = formData.get(fname) as File;
      if (f) answerImages.push(await saveUploadedFile(f, 'answers'));
    }

    const problem = await prisma.problem.create({
      data: {
        title: cfg.title || 'Untitled',
        categoryId: cfg.categoryId,
        difficultyId: cfg.difficultyId,
        problemImages: JSON.stringify(problemImages),
        hint1Image: hint1, hint2Image: hint2, hint3Image: hint3,
        answerImages: JSON.stringify(answerImages),
        createdBy: adminId,
      },
    });
    results.push(problem);
  }

  return NextResponse.json({ created: results.length, problems: results });
}
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }
    // Delete related records first
    await prisma.xpLog.deleteMany({ where: { problemId: { in: ids } } });
    await prisma.redo.deleteMany({ where: { problemId: { in: ids } } });
    await prisma.submission.deleteMany({ where: { problemId: { in: ids } } });
    await prisma.userXp.deleteMany({ where: { problemId: { in: ids } } });
    const deleted = await prisma.problem.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ ok: true, deleted: deleted.count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
