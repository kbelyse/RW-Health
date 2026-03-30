/**
 * Load first: PrismaClient reads DATABASE_URL at construction time.
 * In ESM, imports are evaluated before other statements in index.ts, so dotenv
 * must run from a module imported before prisma.ts (not after inline dotenv.config).
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __srcDir = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(__srcDir, "..");
const prismaDir = path.join(apiRoot, "prisma");

dotenv.config({ path: path.join(apiRoot, ".env") });

/** Align runtime with Prisma CLI: relative file: URLs resolve under apps/api/prisma (same as schema dir). */
function normalizeSqliteDatabaseUrl(): void {
    const raw = process.env.DATABASE_URL?.trim();
    if (!raw?.startsWith("file:"))
        return;
    const rest = raw.slice("file:".length).replace(/^\.\//, "");
    if (path.isAbsolute(rest)) {
        process.env.DATABASE_URL = `file:${rest}`;
        return;
    }
    const abs = path.resolve(prismaDir, rest);
    process.env.DATABASE_URL = `file:${abs}`;
}

normalizeSqliteDatabaseUrl();

if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL?.startsWith("file:")) {
    console.info(`[db] SQLite path: ${process.env.DATABASE_URL.slice("file:".length)}`);
}
