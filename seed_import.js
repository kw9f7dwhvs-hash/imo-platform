// Safe import script - NEVER deletes data, only adds new problems
// Usage: node seed_import.js <source>
// Sources: "imo" (Shortlist), "usamo", or path to JSON file
const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const CAT_MAP = { 0: 'A', 1: 'N', 2: 'G', 3: 'C' };

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

const STAR_RULES = {
  imo: (n) => { if (n <= 2) return 1; if (n === 3) return 2; if (n <= 5) return 3; if (n === 6) return 4; return 5; },
  usamo: (n) => { if (n === 1 || n === 4) return 1; if (n === 2) return 2; if (n === 5) return 3; if (n === 3) return 4; if (n === 6) return 5; return 1; },
};

async function main() {
  const source = process.argv[2] || 'imo';
  const prisma = new PrismaClient();
  
  // Get existing problem titles
  const existing = await prisma.problem.findMany({ select: { title: true } });
  const existingTitles = new Set(existing.map(p => p.title));
  console.log(`Existing problems: ${existing.length}`);
  
  let problems = [];
  
  if (source === 'imo') {
    // IMO Shortlist - from cached file or fetch
    if (fs.existsSync('imo_problems.json')) {
      problems = JSON.parse(fs.readFileSync('imo_problems.json', 'utf-8'));
      for (const p2 of problems) { if (!p2.title) p2.title = String(p2.year) + 'IMOSL'; }
      console.log(`Loaded ${problems.length} problems from imo_problems.json`);
    } else {
      console.log('Fetching IMO Shortlist from mathnet...');
      const manifest = await fetchJSON('https://mathnet.mit.edu/data_v2/manifest.json.gz');
      const rows = manifest.rows;
      const imoSL = rows.filter(r => r[3] === 'IMO-SL');
      console.log(`Found ${imoSL.length} IMO Shortlist problems`);
      for (const r of imoSL) {
        try {
          const full = await fetchJSON(`https://mathnet.mit.edu/data_v2/full/imo/${r[0]}.json`);
          problems.push({
            year: r[2], category: CAT_MAP[r[4]] || 'A', num: r[6],
            title: `${r[2]}IMOSL`,
            text: full.problem_markdown || '',
            solutions: full.solutions_markdown || [],
          });
        } catch(e) { console.log(`  Failed: ${r[0]}`); }
      }
      for (const p2 of problems) { if (!p2.title) p2.title = String(p2.year) + 'IMOSL'; }
      fs.writeFileSync('imo_problems.json', JSON.stringify(problems));
      console.log('Saved to imo_problems.json');
    }
  } else if (source === 'usamo') {
    // USAMO - fetch from mathnet
    console.log('Fetching USAMO from mathnet...');
    const manifest = await fetchJSON('https://mathnet.mit.edu/data_v2/manifest.json.gz');
    const rows = manifest.rows;
    const usamo = rows.filter(r => r[1] === 'united-states' && r[3] === 'USAMO');
    console.log(`Found ${usamo.length} USAMO problems`);
    for (const r of usamo) {
      try {
        const full = await fetchJSON(`https://mathnet.mit.edu/data_v2/full/united-states/${r[0]}.json`);
        const n = r[6];
        problems.push({
          year: r[2], category: CAT_MAP[r[4]] || 'A', num: n,
          title: `${r[2]}USAMOP${n}`,
          text: full.problem_markdown || '',
          solutions: full.solutions_markdown || [],
        });
      } catch(e) { console.log(`  Failed: ${r[0]}`); }
    }
  } else if (fs.existsSync(source)) {
    // Custom JSON file
    problems = JSON.parse(fs.readFileSync(source, 'utf-8'));
    console.log(`Loaded ${problems.length} problems from ${source}`);
  } else {
    console.error(`Unknown source: ${source}`);
    process.exit(1);
  }
  
  // Ensure all problems have titles
  for (const p2 of problems) { if (!p2.title) p2.title = String(p2.year) + "IMOSL"; }

  // Add new OR update existing problems that lack answers
  let added = 0;
  let updated = 0;
  for (const p of problems) {
    if (existingTitles.has(p.title)) {
      // Update answerText if missing
      if (p.solutions && p.solutions.length > 0) {
        const existing = await prisma.problem.findFirst({ where: { title: p.title } });
        if (existing && !existing.answerText) {
          await prisma.problem.update({
            where: { id: existing.id },
            data: { answerText: p.solutions.join('\n\n---\n\n') },
          });
          updated++;
        }
      }
      continue;
    }
    
    const starFn = STAR_RULES[source] || ((n) => 1);
    const star = starFn(p.num);
    const solutions = p.solutions || [];
    
    await prisma.problem.create({
      data: {
        title: p.title,
        categoryId: p.category,
        difficultyId: star,
        problemImages: '[]',
        problemText: p.text || '',
        answerText: solutions.length > 0 ? solutions.join('\n\n---\n\n') : null,
        answerImages: '[]',
        createdBy: 1,
      },
    });
    added++;
  }
  
  console.log(`✅ Added: ${added}, Updated answers: ${updated}, Skipped: ${problems.length - added - updated}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
