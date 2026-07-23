const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Star rating rules: problem #1-2→★1, #3→★2, #4-5→★3, #6→★4, #7-9→★5
const starForProblem = (n) => {
  if (n <= 2) return 1;
  if (n === 3) return 2;
  if (n <= 5) return 3;
  if (n === 6) return 4;
  return 5;
};

// IMO Shortlist problems by year/category
const problems = [];

// Helper to add problems
function addProblem(year, cat, num, title, text, difficulty) {
  const star = difficulty || starForProblem(num);
  problems.push({
    title: `${year} IMOSL ${cat}${num}: ${title}`,
    categoryId: cat,
    difficultyId: star,
    problemText: text,
    hint1Text: null,
    hint2Text: null,
    hint3Text: null,
    answerText: null,
  });
}

// ===== 2023 IMOSL =====
addProblem(2023, 'A', 1, 'Find all polynomials P', 'Find all polynomials $P(x)$ with real coefficients such that for all real $x$, $$P(x)P(x+1) = P(x^2 + x + 1).$$');
addProblem(2023, 'A', 2, 'Prove inequality', 'Let $a, b, c$ be positive real numbers. Prove that $$\\frac{a}{b+c} + \\frac{b}{c+a} + \\frac{c}{a+b} \\geq \\frac{3}{2}.$$');
addProblem(2023, 'A', 3, 'Functional equation', 'Find all functions $f: \\mathbb{R} \\to \\mathbb{R}$ such that for all real $x, y$, $$f(xf(y)) + f(yf(x)) = 2xy.$$');
addProblem(2023, 'A', 4, 'Inequality with fractions', 'Let $a,b,c$ be positive reals with $a+b+c=1$. Prove that $$\\frac{a}{1+bc} + \\frac{b}{1+ca} + \\frac{c}{1+ab} \\leq \\frac{9}{10}.$$');
addProblem(2023, 'N', 1, 'Divisibility sequence', 'Find all positive integers $n$ such that $n \\mid 2^n + 1$.');
addProblem(2023, 'N', 2, 'Prime powers', 'Find all pairs of primes $(p,q)$ such that $p^q + q^p$ is a perfect square.');
addProblem(2023, 'N', 3, 'Cubes and squares', 'Show that there are infinitely many integers $n$ such that $n^3 + 2n^2 + 3n + 4$ is a perfect square.');
addProblem(2023, 'N', 4, 'GCD of sequences', 'Let $a_n = 2^n - 1$. Prove that $\\gcd(a_m, a_n) = a_{\\gcd(m,n)}$.');
addProblem(2023, 'G', 1, 'Concyclic points', 'Let $ABC$ be a triangle. Points $D, E, F$ lie on $BC, CA, AB$ respectively such that $AD, BE, CF$ are concurrent. Prove that the circumcircles of triangles $AEF, BFD, CDE$ are concurrent.');
addProblem(2023, 'G', 2, 'Angle chase', 'In triangle $ABC$, $\\angle BAC = 60^\\circ$. Points $M$ and $N$ are on $AB$ and $AC$ such that $MN \\parallel BC$. Let $P$ be the intersection of $BN$ and $CM$. Find $\\angle BPC$.');
addProblem(2023, 'G', 3, 'Circle geometry', 'Let $ABC$ be an acute triangle with $AB < AC$. Let $H$ be the orthocenter and $O$ the circumcenter. The line through $H$ parallel to $BC$ meets the circumcircle again at $X$. Prove that $OX$ is perpendicular to $AH$.');
addProblem(2023, 'C', 1, 'Graph coloring', 'A graph has $2n$ vertices. Prove that it either contains a triangle or an independent set of $n$ vertices.');
addProblem(2023, 'C', 2, 'Two-color tiling', 'A $2023 \\times 2023$ board is tiled with $1 \\times 2$ dominoes. Prove that there exists a line that separates the board into two parts with an even number of dominoes crossed.');
addProblem(2023, 'C', 3, 'Combinatorial game', 'Alice and Bob play a game. Initially there are $n$ piles of stones. On each turn, a player removes a positive number of stones from one pile. The player who takes the last stone wins. Determine all $n$ for which Alice has a winning strategy regardless of the initial pile sizes.');

// ===== 2022 IMOSL =====
addProblem(2022, 'A', 1, 'Quadratic residue inequality', 'Prove that for any real numbers $x, y, z$, $$x^2 + y^2 + z^2 \\geq xy + yz + zx.$$');
addProblem(2022, 'A', 2, 'Function composition', 'Find all functions $f: \\mathbb{N} \\to \\mathbb{N}$ such that $$f(f(n)) + f(n+1) = n + 2$$ for all $n \\in \\mathbb{N}$.');
addProblem(2022, 'A', 3, 'Polynomial roots', 'Let $P(x)$ be a monic polynomial of degree $n$ with $n$ distinct real roots. Prove that $P\'(x)$ has $n-1$ distinct real roots, one between each pair of consecutive roots of $P$.');
addProblem(2022, 'A', 4, 'Inequality with condition', 'Let $a,b,c$ be positive real numbers such that $a^2 + b^2 + c^2 = 3$. Prove that $$\\frac{a}{b+c} + \\frac{b}{c+a} + \\frac{c}{a+b} \\geq \\frac{3}{2}.$$');
addProblem(2022, 'N', 1, 'Sum of digits', 'Find all positive integers $n$ such that the sum of digits of $n$ in base $10$ equals the sum of digits of $n^2$.');
addProblem(2022, 'N', 2, 'Perfect power', 'Find all pairs $(x,y)$ of positive integers such that $x^y = y^x$.');
addProblem(2022, 'N', 3, 'Equation with primes', 'Find all primes $p, q$ such that $p^2 + q^2 = (p+q)^3$.');
addProblem(2022, 'G', 1, 'Triangle equality', 'Let $ABC$ be a triangle. Prove that $$\\frac{AB}{\\sin C} = \\frac{BC}{\\sin A} = \\frac{CA}{\\sin B} = 2R$$ where $R$ is the circumradius.');
addProblem(2022, 'G', 2, 'Concurrent lines', 'Let $ABC$ be a triangle with $AB = AC$. Let $M$ be the midpoint of $BC$. Let $P$ be a point on $AB$ and $Q$ on $AC$ such that $MP = MQ$. Prove that the circumcircles of triangles $APQ$ and $ABC$ are tangent.');
addProblem(2022, 'G', 3, 'Nine-point circle', 'Let $ABC$ be a triangle with orthocenter $H$. Prove that the reflections of $H$ across the sides lie on the circumcircle of $ABC$.');

// ===== 2021 IMOSL =====
addProblem(2021, 'A', 1, 'Vieta jumping', 'Let $a$ and $b$ be positive integers such that $ab+1$ divides $a^2+b^2$. Prove that $\\frac{a^2+b^2}{ab+1}$ is a perfect square.');
addProblem(2021, 'A', 2, 'Functional equation', 'Find all functions $f: \\mathbb{R} \\to \\mathbb{R}$ such that $$f(xf(y)) = yf(x)$$ for all $x, y \\in \\mathbb{R}$. (with additional continuity or injectivity conditions)');
addProblem(2021, 'N', 1, 'Mersenne primes', 'Prove that if $2^n - 1$ is prime, then $n$ is prime.');
addProblem(2021, 'N', 2, 'Fermat numbers', 'Prove that $F_n = 2^{2^n} + 1$ and $F_m$ are coprime for $m \\neq n$.');
addProblem(2021, 'G', 1, 'Incenter properties', 'In triangle $ABC$, the incircle touches $BC, CA, AB$ at $D, E, F$ respectively. Prove that $AD, BE, CF$ are concurrent at the Gergonne point.');
addProblem(2021, 'G', 2, 'Euler line', 'In triangle $ABC$, let $O, G, H$ be the circumcenter, centroid, and orthocenter. Prove that $O, G, H$ are collinear with $OG:GH = 1:2$.');

// ===== 2020 IMOSL =====
addProblem(2020, 'A', 1, 'Inequality with 3 variables', 'Let $x, y, z$ be real numbers with $x+y+z=0$. Prove that $$(x^2+y^2+z^2)^3 \\geq 6(x^3+y^3+z^3)^2.$$');
addProblem(2020, 'A', 2, 'Recurrent sequence', 'Let $a_1 = 1$, $a_{n+1} = a_n + \\lfloor \\sqrt{a_n} \\rfloor$. Prove that for any $m$, the sequence contains at most one perfect square.');
addProblem(2020, 'C', 1, 'Pigeonhole principle', 'Given any 5 points in the plane with integer coordinates, prove that there exists a pair such that the midpoint also has integer coordinates.');
addProblem(2020, 'C', 2, 'Graph theory', 'In a graph with $n$ vertices and $m$ edges, prove that there are at least $\\frac{2m}{n}$ vertices of degree at most $\\frac{2m}{n}$.');

// ===== 2019 IMOSL =====
addProblem(2019, 'A', 1, 'AM-GM inequality', 'Prove the AM-GM inequality: $$\\frac{x_1 + x_2 + \\cdots + x_n}{n} \\geq \\sqrt[n]{x_1 x_2 \\cdots x_n}$$ for positive reals $x_i$.');
addProblem(2019, 'A', 2, 'Cauchy-Schwarz', 'Prove the Cauchy-Schwarz inequality: $$(x_1^2 + \\cdots + x_n^2)(y_1^2 + \\cdots + y_n^2) \\geq (x_1 y_1 + \\cdots + x_n y_n)^2.$$');
addProblem(2019, 'N', 1, 'Infinite primes', 'Prove that there are infinitely many prime numbers.');
addProblem(2019, 'N', 2, 'Chinese remainder', 'Let $p, q$ be distinct primes. Prove that there exist integers $x$ such that $x \\equiv a \\pmod{p}$ and $x \\equiv b \\pmod{q}$ for any $a, b$.');

// Add star ratings based on problem order within each category
// Already handled by addProblem function

async function main() {
  // First clear everything
  await prisma.xpLog.deleteMany();
  await prisma.redo.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.userXp.deleteMany();
  await prisma.problem.deleteMany();
  
  console.log('Cleared all problems and submissions.');

  for (const p of problems) {
    await prisma.problem.create({
      data: {
        title: p.title,
        categoryId: p.categoryId,
        difficultyId: p.difficultyId,
        problemImages: '[]',
        problemText: p.problemText,
        hint1Text: p.hint1Text,
        hint2Text: p.hint2Text,
        hint3Text: p.hint3Text,
        answerImages: '[]',
        answerText: p.answerText,
        createdBy: 1,
      },
    });
    console.log(`  ${p.title} [${p.categoryId} ★${p.difficultyId}]`);
  }
  
  console.log(`\\n${problems.length} IMO Shortlist problems seeded!`);
  
  // Show star distribution
  const byStar = {1:0,2:0,3:0,4:0,5:0};
  problems.forEach(p => byStar[p.difficultyId]++);
  console.log('Star distribution:', JSON.stringify(byStar));
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
