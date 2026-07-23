import { prisma } from './prisma';

export async function checkAndTriggerRedos(studentId: number): Promise<number> {
  const now = new Date();
  const dueRedos = await prisma.redo.findMany({
    where: { studentId, completed: false, dueDate: { lte: now } },
  });
  for (const redo of dueRedos) {
    await prisma.redo.update({ where: { id: redo.id }, data: { completed: true } });
  }
  return dueRedos.length;
}

export async function scheduleRedo(problemId: number, studentId: number): Promise<void> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  await prisma.redo.create({ data: { problemId, studentId, dueDate, completed: false } });
}
