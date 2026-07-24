const { execSync } = require("child_process");
const port = process.env.PORT || "3000";

try {
  execSync("npx prisma db push --accept-data-loss", { stdio: "pipe", env: { ...process.env } });
} catch(e) {
  // DB setup might fail, that's ok
}
try {
  execSync("node prisma/seed.js", { stdio: "pipe", env: { ...process.env } });
} catch(e) {
  // Seed might fail if already seeded, that's ok
}

execSync("npx next start -p " + port + " -H 0.0.0.0", { stdio: "inherit" });
