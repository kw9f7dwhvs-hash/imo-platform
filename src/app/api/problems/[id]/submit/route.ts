import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  const studentId = parseInt(user.id);
  const problemId = parseInt(params.id);

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Check wallet
  const walletCheck = await prisma.wallet.findUnique({ where: { userId: studentId } });
  if (!walletCheck || walletCheck.balance < 10) {
    return NextResponse.json({ error: "Insufficient coins (need 10)" }, { status: 400 });
  }

  let imagePath: string | null = null;
  let solutionText: string | null = null;

  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    solutionText = formData.get('text') as string || null;
    if (file && file.size > 0) imagePath = await saveUploadedFile(file, 'submissions');
    if (!imagePath && !solutionText) return NextResponse.json({ error: 'Upload an image or write a solution' }, { status: 400 });
  } else {
    const body = await req.json();
    solutionText = body.text || null;
    if (!solutionText) return NextResponse.json({ error: 'No solution text provided' }, { status: 400 });
  }

  const existing = await prisma.submission.findFirst({
    where: { problemId, studentId, status: { in: ['pending', 'needs_clarification', 'needs_correction'] } },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) {
    const updated = await prisma.submission.update({
      where: { id: existing.id },
      data: { imagePath, solutionText, status: 'pending', grade: null, feedback: null, gradedAt: null, gradedBy: null, attemptCount: { increment: 1 } },
    });
    return NextResponse.json(updated);
  }

  const submission = await prisma.submission.create({
    data: { problemId, studentId, imagePath, solutionText, status: 'pending', attemptCount: 1 },
  });

  // Deduct 1 coin
  const wallet = await prisma.wallet.findUnique({ where: { userId: studentId } });
  if (wallet && wallet.balance >= 10) {
    await prisma.wallet.update({ where: { userId: studentId }, data: { balance: { decrement: 10 } } });
    await prisma.transaction.create({ data: { userId: studentId, amount: -10, reason: 'submit', message: 'Submission cost' } });
  }
  return NextResponse.json(submission);
}
