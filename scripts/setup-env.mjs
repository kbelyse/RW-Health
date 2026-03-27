import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, "apps/api/.env");
const examplePath = path.join(root, "apps/api/.env.example");

if (!fs.existsSync(examplePath)) {
  console.error("Missing apps/api/.env.example");
  process.exit(1);
}
if (fs.existsSync(envPath)) {
  console.info("apps/api/.env already exists — leaving it unchanged.");
  process.exit(0);
}
fs.copyFileSync(examplePath, envPath);
console.info("Created apps/api/.env from .env.example");
console.info("For production, set JWT_SECRET to a new random string (32+ characters).");
