const XP_BASE: Record<number, number> = { 1: 10, 2: 30, 3: 90, 4: 270, 5: 810 };
const HINT_MULTS: Record<number, number> = { 0: 1.0, 1: 0.7, 2: 0.4, 3: 0.1 };

export function calculateFinalXp(difficultyId: number, hintsUsed: number, isFirstAttempt: boolean): number {
  const base = XP_BASE[difficultyId] || 10;
  const hintMult = HINT_MULTS[hintsUsed] ?? 0;
  const firstMult = isFirstAttempt ? 1.2 : 1.0;
  if (hintMult === 0) return 0;
  return Math.round(base * hintMult * firstMult);
}

// Cumulative XP for level N: 50 x N x (N-1) / 2 (triangular numbers)
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * level * (level - 1) / 2;
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  while (getXpForLevel(level + 1) <= totalXp) level++;
  return level;
}

export function getXpProgress(totalXp: number) {
  const level = getLevelFromXp(totalXp);
  const current = getXpForLevel(level);
  const next = getXpForLevel(level + 1);
  const progress = next > current ? (totalXp - current) / (next - current) : 1;
  return { level, currentXp: totalXp - current, nextLevelXp: next - current, progress };
}

const levelTitles: Record<number, string> = {
  1: 'Math Explorer',
  2: 'Pattern Seeker',
  3: 'Proof Apprentice',
  4: 'Theorem Hunter',
  5: 'Conjecture Breaker',
  6: 'Olympiad Challenger',
  7: 'Gold Medalist',
  8: 'Grandmaster',
  9: 'Math Sage',
  10: 'IMO Legend',
  11: 'Number Whisperer',
  12: 'Geometry Weaver',
  13: 'Algebra Alchemist',
  14: 'Prime Guardian',
  15: 'Equation Solver',
  16: 'Shape Shifter',
  17: 'Infinity Seeker',
  18: 'Logic Forger',
  19: 'Proof Architect',
  20: 'Symmetry Dancer',
  21: 'Sequence Prophet',
  22: 'Graph Pioneer',
  23: 'Root Finder',
  24: 'Limit Breaker',
  25: 'Derivative Lord',
  26: 'Integral Master',
  27: 'Matrix Mage',
  28: 'Vector Voyager',
  29: 'Dimension Walker',
  30: 'Fractal Weaver',
  31: 'Polynomial King',
  32: 'Topology Dreamer',
  33: 'Group Theorist',
  34: 'Ring Bearer',
  35: 'Field Marshal',
  36: 'Category Sage',
  37: 'Homology Hero',
  38: 'Manifold Explorer',
  39: 'Spectrum Seer',
  40: 'Euler Successor',
  41: 'Gauss Descendant',
  42: 'Ramanujan Protege',
  43: 'Erdos Collaborator',
  44: 'Hilbert Successor',
  45: 'Noether Apprentice',
  46: 'Von Neumann Peer',
  47: 'Turing Equal',
  48: 'Godel Counterpart',
  49: 'Newton Successor',
  50: 'Axiom Shaper',
  51: 'Paradox Tamer',
  52: 'Conjecture Solver',
  53: 'Millennium Candidate',
  54: 'Proof Machine',
  55: 'Counterexample Hunter',
  56: 'Lemma Collector',
  57: 'Corollary Crafter',
  58: 'Abstraction Ascendant',
  59: 'Pure Reasoner',
  60: 'Algebraic Geometer',
  61: 'Arithmetic Geometer',
  62: 'Complex Analyst',
  63: 'Functional Analyst',
  64: 'Harmonic Analyst',
  65: 'Numerical Alchemist',
  66: 'Stochastic Sage',
  67: 'Dynamical Prophet',
  68: 'Chaotician',
  69: 'Singularity Tamer',
  70: 'Riemann Shadow',
  71: 'Galois Successor',
  72: 'Abel Descendant',
  73: 'Lagrange Successor',
  74: 'Cauchy Continuation',
  75: 'Fourier Echo',
  76: 'Laplace Vision',
  77: 'Poisson Pattern',
  78: 'Dirichlet Legacy',
  79: 'Jacobi Path',
  80: 'Zeta Regulator',
  81: 'P vs NP Contemplator',
  82: 'Hodge Whisperer',
  83: 'Yang-Mills Theorist',
  84: 'Navier-Stokes Navigator',
  85: 'Birch-Swinnerton Seer',
  86: 'Poincare Perseverer',
  87: 'Riemann Hypothesis Solver',
  88: 'Universe Equation',
  89: 'Absolute Infinite',
  90: 'Polymath Prime',
  91: 'Math Dragon',
  92: 'Eternal Theorem',
  93: 'Omega Constant',
  94: 'Proof of Everything',
  95: 'Abstract Singularity',
  96: 'Mathematical Deity',
  97: 'Beyond Infinity',
  98: 'Meta-Mathematician',
  99: 'The Axiom Itself',
  100: 'The Axiom Itself',
};

export function getLevelTitle(level: number): string {
  if (level <= 1) return levelTitles[1];
  if (level > 100) return levelTitles[100];
  const keys = Object.keys(levelTitles).map(Number).sort((a, b) => a - b);
  let title = levelTitles[keys[keys.length - 1]];
  for (const k of keys) {
    if (level >= k) title = levelTitles[k];
  }
  return title;
}

const catFlavors: Record<string, string> = {
  A: 'Algebra',
  N: 'Number Theory',
  G: 'Geometry',
  C: 'Combinatorics',
};

export function getFullTitle(categoryId: string, level: number): string {
  const cat = catFlavors[categoryId] || '';
  const title = getLevelTitle(level);
  return cat ? cat + ' ' + title : title;
}
