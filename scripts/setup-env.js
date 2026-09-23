import fs from "node:fs";
import path from "node:path";

const targetEnv = process.argv[2];
if (!targetEnv) {
  console.error("Please specify an env file, e.g. .env-dev or .env-prod");
  process.exit(1);
}

const targetPath = path.resolve(process.cwd(), targetEnv);
if (!fs.existsSync(targetPath)) {
  console.error(`Missing ${targetEnv} file at ${targetPath}`);
  process.exit(1);
}

const destPath = path.resolve(process.cwd(), ".env");
fs.copyFileSync(targetPath, destPath);
console.log(`Successfully copied ${targetEnv} to .env`);
