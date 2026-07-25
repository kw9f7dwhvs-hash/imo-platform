// USAMO Problem Seed Script
// Star ratings: P1/P4=★1, P2=★2, P5=★3, P3=★4, P6=★5
// Title format: YYYYUSAMOP1, YYYYUSAMOP2, etc.
const https = require('https');
const zlib = require('zlib');
const { PrismaClient } = require('@prisma/client');

const CAT_MAP = { 0: 'A', 1: 'N', 2: 'G', 3: 'C' };

function starForProblem(n) {
  if (n === 1 || n === 4) return 1;
  if (n === 2) return 2;
  if (n === 5) return 3;
  if (n === 3) return 4;
  if (n === 6) return 5;
  return 1;
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
            zlib.gunzip(buf, (e, d) => { if (e) reject(e); else resolve(JSON.parse(d.toString())); });
          } else { resolve(JSON.parse(buf.toString())); }
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const prisma = new PrismaClient();
  
  // Check which USAMO problems already exist
  const existing = await prisma.problem.findMany({ where: { title: { startsWith: '20' } }, select: { title: true } });
  const existingTitles = new Set(existing.map(p => p.title));
  console.log(`Existing problems: ${existing.length}`);
  
  console.log('Fetching manifest...');
  const manifest = await fetchJSON('https://mathnet.mit.edu/data_v2/manifest.json.gz');
  const rows = manifest.rows;
  
  const usamo = rows.filter(r => r[1] === 'united-states' && r[3] === 'USAMO');
  console.log(`USAMO problems found: ${usamo.length}`);
  
  let added = 0;
  let skipped = 0;
  
  for (const r of usamo) {
    const slug = r[0];
    const year = r[2];
    const probNum = r[6];
    const catId = CAT_MAP[r[4]] || 'A';
    const title = `${year}USAMOP${probNum}`;
    
    if (existingTitles.has(title)) {
      skipped++;
      continue;
    }
    
    try {
      const full = await fetchJSON(`https://mathnet.mit.edu/data_v2/full/united-states/${slug}.json`);
      const text = full.problem_markdown || '';
      const solutions = full.solutions_markdown || [];
      const star = starForProblem(probNum);
      
      await prisma.problem.create({
        data: {
          title,
          categoryId: catId,
          difficultyId: star,
          problemImages: '[]',
          problemText: text,
          answerText: solutions.length > 0 ? solutions.join('\n\n---\n\n') : null,
          answerImages: '[]',
          createdBy: 1,
        },
      });
      added++;
      console.log(`  Added: ${title} (${catId}, ★${star})`);
    } catch(e) {
      console.log(`  Failed: ${slug} - ${e.message.substring(0, 50)}`);
    }
  }
  
  console.log(`\n✅ Added: ${added}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
