import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const problems = await prisma.problem.findMany({
    include: {
      category: true,
      difficultyTier: true,
      submissions: {
        include: { student: { select: { id: true, username: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { id: "desc" },
    take: 50,
  });

  const result = problems.map(p => {
    // Get latest submission per student
    const latestPerStudent = new Map();
    for (const sub of p.submissions) {
      if (!latestPerStudent.has(sub.studentId)) {
        latestPerStudent.set(sub.studentId, sub);
      }
    }
    return {
      id: p.id,
      title: p.title,
      categoryId: p.categoryId,
      category: p.category,
      difficultyTier: p.difficultyTier,
      students: Array.from(latestPerStudent.values()).map(sub => ({
        username: sub.student?.username,
        status: sub.status,
        grade: sub.grade,
        hintsUsed: sub.hintsUsed,
        attemptCount: sub.attemptCount,
        createdAt: sub.createdAt,
      })),
    };
  });

  return NextResponse.json(result);
}
