import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const diffFilter = url.searchParams.get('difficulty') || '';
  
  const where: any = {};
  if (diffFilter) where.difficultyId = parseInt(diffFilter);
  if (search) where.title = { contains: search };
  
  const problems = await prisma.problem.findMany({
    where,
    include: { category: true, difficultyTier: true, creator: { select: { username: true } } },
    orderBy: { id: 'desc' },
    take: 200,
  });

  return NextResponse.json(problems.map((p: any) => ({
    id: p.id, title: p.title, categoryId: p.categoryId, difficultyId: p.difficultyId,
    category: p.category, difficultyTier: p.difficultyTier,
    createdAt: p.createdAt.toISOString(), creator: p.creator.username,
  })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const adminId = parseInt(user.id);

  const formData = await req.formData();
  const title = formData.get('title') as string;
  const categoryId = formData.get('categoryId') as string;
  const difficultyId = parseInt(formData.get('difficultyId') as string);
  const problemText = formData.get('problemText') as string || null;
  const hint1Text = formData.get('hint1Text') as string || null;
  const hint2Text = formData.get('hint2Text') as string || null;
  const hint3Text = formData.get('hint3Text') as string || null;
  const answerText = formData.get('answerText') as string || null;

  // Problem images (multiple allowed)
  const problemFiles = formData.getAll('problemImages') as File[];
  const problemImages: string[] = [];
  for (const f of problemFiles) {
    if (f && f.size > 0) problemImages.push(await saveUploadedFile(f, 'problems'));
  }

  // Hint images
  const hint1File = formData.get('hint1Image') as File | null;
  const hint2File = formData.get('hint2Image') as File | null;
  const hint3File = formData.get('hint3Image') as File | null;
  const hint1Image = hint1File?.size ? await saveUploadedFile(hint1File, 'hints') : null;
  const hint2Image = hint2File?.size ? await saveUploadedFile(hint2File, 'hints') : null;
  const hint3Image = hint3File?.size ? await saveUploadedFile(hint3File, 'hints') : null;

  // Answer images
  const answerFiles = formData.getAll('answerImages') as File[];
  const answerImages: string[] = [];
  for (const f of answerFiles) {
    if (f && f.size > 0) answerImages.push(await saveUploadedFile(f, 'answers'));
  }

  const problem = await prisma.problem.create({
    data: {
      title, categoryId, difficultyId,
      problemImages: JSON.stringify(problemImages),
      problemText,
      hint1Image, hint1Text, hint2Image, hint2Text, hint3Image, hint3Text,
      answerImages: JSON.stringify(answerImages),
      answerText,
      createdBy: adminId,
    },
  });

  return NextResponse.json(problem);
}
