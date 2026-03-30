import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function walk(dir, acc = []) {
  const names = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of names) {
    if (ent.name === "node_modules" || ent.name === "dist" || ent.name === ".git") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function scriptKindFor(filePath) {
  if (filePath.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (filePath.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (filePath.endsWith(".js") || filePath.endsWith(".mjs") || filePath.endsWith(".cjs")) {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
}

function stripTsLike(abs) {
  const raw = fs.readFileSync(abs, "utf8");
  if (!raw.includes("//") && !raw.includes("/*") && !raw.includes("*/") && !raw.includes("{/*")) {
    return;
  }
  const kind = scriptKindFor(abs);
  const sf = ts.createSourceFile(abs, raw, ts.ScriptTarget.Latest, true, kind);
  const printer = ts.createPrinter({
    removeComments: true,
    newLine: ts.NewLineKind.LineFeed,
  });
  const out = printer.printFile(sf);
  fs.writeFileSync(abs, out.endsWith("\n") ? out : out + "\n");
}

function stripCss(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, "");
}

function stripPrisma(content) {
  return content
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (t.startsWith("//")) return false;
      return true;
    })
    .join("\n");
}

function stripEnvExample(content) {
  return content
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

const all = walk(path.join(root, "apps")).concat(walk(path.join(root, "packages")));

for (const abs of all) {
  const ext = path.extname(abs);
  if ([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(ext)) {
    try {
      stripTsLike(abs);
    } catch (e) {
      console.error("Failed:", path.relative(root, abs), e.message);
      process.exit(1);
    }
  } else if (ext === ".css") {
    const raw = fs.readFileSync(abs, "utf8");
    if (raw.includes("/*")) fs.writeFileSync(abs, stripCss(raw));
  } else if (ext === ".prisma") {
    const raw = fs.readFileSync(abs, "utf8");
    if (raw.includes("//")) fs.writeFileSync(abs, stripPrisma(raw));
  }
}

const envExample = path.join(root, "apps/api/.env.example");
if (fs.existsSync(envExample)) {
  const raw = fs.readFileSync(envExample, "utf8");
  if (raw.includes("#")) fs.writeFileSync(envExample, stripEnvExample(raw));
}

console.info("Removed comments (TypeScript printer + CSS/prisma/env).");
