const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const cats = [
    { id: 'A', name: 'Algebra', displayNameCn: '\u4ee3\u6570' },
    { id: 'N', name: 'Number Theory', displayNameCn: '\u6570\u8bba' },
    { id: 'G', name: 'Geometry', displayNameCn: '\u51e0\u4f55' },
    { id: 'C', name: 'Combinatorics', displayNameCn: '\u7ec4\u5408' },
  ];
  for (const c of cats) {
    await prisma.category.upsert({ where: { id: c.id }, update: c, create: c });
  }
  const tiers = [
    { id: 1, name: '\u26051', xpValue: 10, problemCount: 14 },
    { id: 2, name: '\u26052', xpValue: 30, problemCount: 25 },
    { id: 3, name: '\u26053', xpValue: 90, problemCount: 25 },
    { id: 4, name: '\u26054', xpValue: 270, problemCount: 25 },
    { id: 5, name: '\u26055', xpValue: 810, problemCount: 36 },
  ];
  for (const t of tiers) {
    await prisma.difficultyTier.upsert({ where: { id: t.id }, update: t, create: t });
  }
  const ah = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({ where: { username: 'admin' }, update: {}, create: { username: 'admin', passwordHash: ah, role: 'admin' } });
  const sh = await bcrypt.hash('student123', 10);
  await prisma.user.upsert({ where: { username: 'demo' }, update: {}, create: { username: 'demo', passwordHash: sh, role: 'student' } });
  console.log('Seed done: admin/admin123, demo/student123');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
