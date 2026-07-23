import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const problem = await prisma.problem.findUnique({
    where: { id: parseInt(params.id) },
    include: { category: true, difficultyTier: true },
  });
  if (!problem) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: problem.id, title: problem.title, categoryId: problem.categoryId, difficultyId: problem.difficultyId,
    problemText: problem.problemText,
    hint1Text: problem.hint1Text, hint2Text: problem.hint2Text, hint3Text: problem.hint3Text,
    answerText: problem.answerText,
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const data: any = {
    title: formData.get('title') as string,
    categoryId: formData.get('categoryId') as string,
    difficultyId: parseInt(formData.get('difficultyId') as string),
    problemText: formData.get('problemText') as string || null,
    hint1Text: formData.get('hint1Text') as string || null,
    hint2Text: formData.get('hint2Text') as string || null,
    hint3Text: formData.get('hint3Text') as string || null,
    answerText: formData.get('answerText') as string || null,
  };

  // Handle image uploads if provided
  const problemFiles = formData.getAll('problemImages') as File[];
  if (problemFiles.length > 0 && problemFiles[0].size > 0) {
    const images: string[] = [];
    for (const f of problemFiles) images.push(await saveUploadedFile(f, 'problems'));
    data.problemImages = JSON.stringify(images);
  }

  const problem = await prisma.problem.update({
    where: { id: parseInt(params.id) },
    data,
  });

  return NextResponse.json(problem);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.problem.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ ok: true });
}
