# RW-Health Passport

Web app for consolidated health records and lab results (Rwanda context, ALU formative project). **Monorepo:** React PWA (`apps/web`) + Express API (`apps/api`) + Prisma/SQLite.

---

## Summative submission checklist (Canvas)

Use this list before you submit the **Google Doc** link on Canvas.

| Requirement | What to do |
|-------------|------------|
| **Google Doc name** | `personNames_[Summative]_[MMDDYYYY]` (replace with your names and date, e.g. `AdaLovelace_Bob_Summative_03282026`) |
| **In the doc** | Link to your **video** (5–10 min), **public GitHub repo**, **SRS document**, and **publicly accessible app URL** |
| **GitHub** | Public repo; this README must be enough for someone to run the project locally |
| **Sharing** | Google Doc: **Anyone with the link can view**; test every link in an incognito window |
| **Broken links** | Broken links can score **0**; double-check after publishing |

**Video should cover (among other points):**  
- What the system is · **problem statement** · why it matters · **proposed solution** · **live demo**  
- How the prototype reflects the **SRS** and the **actors / processes** in your system design  

---

## What reviewers will run (quick path)

1. Install **Node.js 20+** and **Git** (npm is included with Node).
2. Clone your **public** GitHub repository and `cd` into the project root (the folder that contains this `README.md`).
3. Run **exactly** these commands in order:

```bash
npm install
npm run setup
npm run db:push
npm run db:seed
npm run dev
```

4. Open a browser at **http://localhost:5173**  
   - The frontend runs on port **5173** and proxies `/api` to the API on **http://localhost:4000**.

5. **Stop the servers:** in the terminal where `npm run dev` is running, press `Ctrl+C`.

If anything fails, see **Troubleshooting** below.

---

## Step-by-step (first-time setup)

### Step 1 — Clone the repository

```bash
git clone <YOUR_PUBLIC_GITHUB_URL>
cd <folder-name>
```

You should see `apps/`, `packages/`, `package.json`, and this `README.md`.

### Step 2 — Install dependencies

```bash
npm install
```

**Expected:** `node_modules/` is created at the repo root (no errors).

### Step 3 — Create the API environment file

```bash
npm run setup
```

**What it does:** copies `apps/api/.env.example` → `apps/api/.env` if `.env` does not exist yet.  
**Do not commit `apps/api/.env`** (it is gitignored).

### Step 4 — Create the database and tables

```bash
npm run db:push
```

**Expected:** SQLite file `apps/api/dev.db` is created/updated. Uses Prisma with `DATABASE_URL` from the npm script.

### Step 5 — Seed demo data (users, sample records)

```bash
npm run db:seed
```

**Expected:** Demo users are inserted (see table below).

### Step 6 — Start API + web together

```bash
npm run dev
```

**Expected:** Two processes start (API + Vite). Logs should show the API listening on port **4000** and Vite on **5173**.

### Step 7 — Open the app

- Browser: **http://localhost:5173**
- Register a new account or sign in with a demo account.

---

## Demo accounts (after `npm run db:seed`)

| Role   | Email               | Password |
|--------|---------------------|----------|
| Patient | `patient@demo.local` | `DemoRw2026!` |
| Clinician | `clinician@demo.local` | `DemoRw2026!` |
| Lab | `lab@demo.local` | `DemoRw2026!` |
| Admin | `admin@demo.local` | `DemoRw2026!` |

---

## What each npm script does

| Command | Purpose |
|---------|---------|
| `npm install` | Installs all workspace packages (`apps/web`, `apps/api`, `packages/shared`). |
| `npm run setup` | Creates `apps/api/.env` from `.env.example` if missing. |
| `npm run db:push` | Applies Prisma schema to `apps/api/dev.db`. |
| `npm run db:seed` | Loads demo users and sample data. |
| `npm run dev` | Runs API (`:4000`) and web dev server (`:5173`) with `/api` proxy. |
| `npm run build` | Builds shared package, API, and production frontend bundle. |

---

## Production build (local check)

```bash
npm run build
```

Produces:

- `apps/api/dist/` — compiled API  
- `apps/web/dist/` — static frontend  

---

## Public deployment (one URL for Canvas)

The grader needs a **public URL** that works from any browser. The app uses **cookie-based auth** and calls **`/api`** on the **same site**, so the simplest deployment is **one server** that serves both the API and the built frontend.

### 1. Build everything

From the repo root:

```bash
npm install
npm run build
```

### 2. Production environment variables

On the host (e.g. Railway, Render, Fly.io), set at least:

| Variable | Example | Notes |
|----------|---------|--------|
| `NODE_ENV` | `production` | Required for SPA static serving path. |
| `PORT` | `4000` or platform’s port | Use `$PORT` if the platform injects it. |
| `DATABASE_URL` | `file:./prod.db` | SQLite path on disk; use a **persistent disk** if your host wipes ephemeral storage. |
| `JWT_SECRET` | long random string (min 32 chars) | **Required**; never commit. |
| `COOKIE_SECURE` | `true` | Use HTTPS in production. |
| `CORS_ORIGIN` | `https://your-public-domain.com` | **Must match** the public URL of the app (same origin in this setup). |
| `WEB_DIST` | `../web/dist` | If the process **working directory** is `apps/api`, this points to the built UI. |

Run migrations/seed on the server as needed (e.g. `npx prisma db push` and `npm run db:seed` with `DATABASE_URL` set, from `apps/api`).

### 3. Start command (typical)

From `apps/api` (after `npm run build` at repo root):

```bash
NODE_ENV=production WEB_DIST=../web/dist node dist/index.js
```

Adjust `WEB_DIST` to an absolute path if your host starts from a different directory.

### 4. HTTPS

Use the platform’s HTTPS or a reverse proxy. Set `COOKIE_SECURE=true` and `CORS_ORIGIN` to your **https** URL.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| `npm install` fails | Use Node.js **20 LTS**; delete `node_modules` and `package-lock.json` only if your instructor allows, then reinstall. |
| `JWT_SECRET` / config errors | Ensure `apps/api/.env` exists (`npm run setup`) and `JWT_SECRET` is at least 32 characters. |
| `db:push` fails | Run from repo root; ensure `apps/api/.env` exists with `DATABASE_URL=file:./dev.db`. |
| Blank page / API errors | Confirm **both** processes are up (`npm run dev`) and you are using **http://localhost:5173** (not only port 4000). |
| Emails not sending | Password reset uses SMTP only if `SMTP_*` is set in `apps/api/.env`; otherwise check API logs in development. |

---

## Repository layout

| Path | Purpose |
|------|---------|
| `apps/web` | Vite + React + Tailwind + PWA |
| `apps/api` | Express + Prisma + SQLite |
| `packages/shared` | Shared TypeScript types |
| `scripts/setup-env.mjs` | Copies `.env.example` → `.env` |

See **`AUTHORS`** for contributor names (ALU-style).

---

## SRS document

Add your **SRS** as a **PDF or Google Doc** link in the submission Google Doc (not necessarily in this repo). If you also store a copy in the repo, link it from this README.

---

## Git: own repo for submission

```bash
cd RW-Health
git init
git add .
git status
git commit -m "Initial commit: RW-Health Passport monorepo"
```

Push to a **public** GitHub repository. `.gitignore` excludes `node_modules`, `apps/api/.env`, and `*.db`.

---

## Security

- Never commit secrets; only use `apps/api/.env` locally or in the host’s secret store.
- The browser talks to **`/api`** only; no API keys are embedded in the client bundle.

---

## License

Academic / formative use unless your institution specifies otherwise.
