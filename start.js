const { execSync } = require("child_process");
const port = process.env.PORT || "3000";

try {
  execSync("npx prisma generate", { stdio: "inherit", env: { ...process.env } });
} catch(e) {
  console.log("prisma generate failed (might be OK)");
}
try {
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", env: { ...process.env } });
} catch(e) {
  console.log("prisma db push failed");
}
try {
  execSync("node prisma/seed.js", { stdio: "inherit", env: { ...process.env } });
} catch(e) {
  console.log("seed failed (might be OK)");
}

execSync("npx next start -p " + port + " -H 0.0.0.0", { stdio: "inherit" });
