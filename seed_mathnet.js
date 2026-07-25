const fs = require('fs');
const https = require('https');
const zlib = require('zlib');

const CAT_MAP = { 0: 'A', 1: 'N', 2: 'G', 3: 'C' };

function starForProblemNum(n) {
  if (n <= 2) return 1;
  if (n === 3) return 2;
  if (n <= 5) return 3;
  if (n === 6) return 4;
  return 5;
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept-Encoding': 'gzip' } }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        try {
          if (buf[0] === 0x1f && buf[1] === 0x8b) {
            zlib.gunzip(buf, (e, d) => {
              if (e) reject(e); else resolve(JSON.parse(d.toString()));
            });
          } else {
            resolve(JSON.parse(buf.toString()));
          }
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching manifest...');
  const manifest = await fetchJSON('https://mathnet.mit.edu/data_v2/manifest.json.gz');
  const rows = manifest.rows;
  const imoSL = rows.filter(r => r[3] === 'IMO-SL');
  console.log('Found ' + imoSL.length + ' IMO Shortlist problems');

  const byYear = {};
  for (const r of imoSL) {
    const y = r[2];
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(r);
  }

  const problems = [];
  const years = Object.keys(byYear).sort();

  for (const year of years) {
    const entries = byYear[year];
    console.log('\n' + year + ': ' + entries.length + ' problems');
    for (let i = 0; i < entries.length; i++) {
      const r = entries[i];
      const slug = r[0];
      const catId = CAT_MAP[r[4]] || 'A';
      const probNum = r[6];
      const star = starForProblemNum(probNum);

      try {
        const full = await fetchJSON('https://mathnet.mit.edu/data_v2/full/imo/' + slug + '.json');
        problems.push({
          title: year + ' IMOSL',
          categoryId: catId,
          difficultyId: star,
          problemText: full.problem_markdown || '',
        });
        if ((i + 1) % 10 === 0 || i === entries.length - 1) {
          console.log('  [' + catId + probNum + ' ★' + star + '] ' + (i + 1) + '/' + entries.length);
        }
      } catch(e) {
        console.log('  ✗ Failed: ' + slug);
      }
    }
  }

  console.log('\nTotal fetched: ' + problems.length);

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  await prisma.xpLog.deleteMany();
  await prisma.redo.deleteMany();
  await prisma.hintPool.deleteMany();
  await prisma.hintFeedback.deleteMany();
  await prisma.studentFeedback.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.userXp.deleteMany();
  await prisma.problem.deleteMany();
  console.log('Cleared old problems');

  for (const p of problems) {
    await prisma.problem.create({
      data: {
        title: p.title,
        categoryId: p.categoryId,
        difficultyId: p.difficultyId,
        problemImages: '[]',
        problemText: p.problemText,
        answerImages: '[]',
        createdBy: 1,
      },
    });
  }

  const byStar = {};
  const byCat = {};
  for (const p of problems) {
    byStar[p.difficultyId] = (byStar[p.difficultyId] || 0) + 1;
    byCat[p.categoryId] = (byCat[p.categoryId] || 0) + 1;
  }
  console.log('Stars:', JSON.stringify(byStar));
  console.log('Cats:', JSON.stringify(byCat));
  console.log('✅ All ' + problems.length + ' problems imported!');

  await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
