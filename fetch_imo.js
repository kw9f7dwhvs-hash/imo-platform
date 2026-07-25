// Run: node fetch_imo.js
// Fetches all IMO Shortlist problems and saves to imo_problems.json
const fs = require('fs');
const https = require('https');
const zlib = require('zlib');

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
  console.log('Fetching manifest...');
  const manifest = await fetchJSON('https://mathnet.mit.edu/data_v2/manifest.json.gz');
  const rows = manifest.rows;
  const CAT_MAP = { 0: 'A', 1: 'N', 2: 'G', 3: 'C' };
  
  function star(n) { if (n <= 2) return 1; if (n === 3) return 2; if (n <= 5) return 3; if (n === 6) return 4; return 5; }
  
  const imoSL = rows.filter(r => r[3] === 'IMO-SL');
  console.log('Found ' + imoSL.length + ' problems');

  const results = [];
  for (let i = 0; i < imoSL.length; i++) {
    const r = imoSL[i];
    try {
      const full = await fetchJSON('https://mathnet.mit.edu/data_v2/full/imo/' + r[0] + '.json');
      results.push({
        slug: r[0], year: r[2], category: CAT_MAP[r[4]] || 'A', num: r[6], star: star(r[6]),
        text: full.problem_markdown || '',
      });
    } catch(e) { console.log('Failed: ' + r[0]); }
    if ((i + 1) % 25 === 0) console.log('  ' + (i + 1) + '/' + imoSL.length);
  }
  
  fs.writeFileSync('imo_problems.json', JSON.stringify(results));
  console.log('Saved ' + results.length + ' problems to imo_problems.json');
}
main().catch(console.error);
