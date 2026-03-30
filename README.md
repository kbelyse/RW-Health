# RW-Health Passport

## Description of the system

**RW-Health Passport** is a web application that consolidates health-related information in one place: a patient can view records, lab results, appointments, and care-team context; clinicians and staff can manage scheduling, visits, and patient charts; lab staff can upload structured results. The stack is a **React (Vite) PWA** frontend, an **Express** API, **Prisma** with **SQLite**, and cookie-based authentication.

---

## Problem statement

Patients and care teams often rely on fragmented information (paper, ad hoc messages, separate systems). That makes it harder to see a complete picture of care, coordinate visits, and share lab data in a structured way.

---

## Why is this a problem?

Fragmented health information increases friction for patients (harder to follow their own care), for clinicians (more time spent reconciling details), and for quality of care (missed context). A single, coherent portal reduces duplication and improves clarity when designed around the roles that actually use the system.

---

## Proposed solution

This prototype implements a **digital health passport**: role-based dashboards (patient, clinician, lab, admin), authentication, appointments and scheduling, visit records, lab workflows, and patient charts—aligned with the course SRS and system design. It is intended as a **demonstration prototype**, not a certified medical device.

---

## Demo

- **Video walkthrough:** paste your **5–10 minute demo URL** in your submission Google Doc (required by the course).  
- **Live public app:** **`<paste your live deployment URL here>`** — replace this line with a real, publicly reachable URL before submission.  
- The sections below describe how to run the **same** project **locally** so graders and reviewers can verify the code.

---

## SRS and system design

The prototype is built to reflect the **functional requirements** in the **SRS** and the **actors and processes** described in the **system design** (e.g. patient, clinician, lab, admin flows; login/register; core pages and flows).  

**Link to SRS document:** **`<paste your SRS link here (Google Doc or PDF)>`** — add the working link in your Google Doc and optionally here once it is stable.

---

## How to run the project locally (every step)

Follow these steps **in order** from a clean machine. Use a terminal (PowerShell, Command Prompt, Terminal, or Git Bash on Windows).

### Prerequisites

1. Install **Node.js 20+** (LTS recommended).  
   - Check: `node -v` → should show `v20.x` or higher.  
2. Install **Git**.  
   - Check: `git --version`.  
3. **npm** is included with Node.  
   - Check: `npm -v`.

### Step 1 — Clone the repository

```bash
git clone <YOUR_PUBLIC_GITHUB_REPO_URL>
cd <folder-name>
```

You should see `apps/`, `packages/`, `package.json`, and this `README.md` in the project root.

### Step 2 — Install dependencies

```bash
npm install
```

**Expected:** Command completes without errors; `node_modules/` appears at the repo root.

### Step 3 — Create the API environment file

```bash
npm run setup
```

**What it does:** If `apps/api/.env` does **not** exist, it copies `apps/api/.env.example` → `apps/api/.env`.  
**If you already have `apps/api/.env`**, this step does not overwrite it.

**Important:** Do **not** commit `apps/api/.env` (it is gitignored). It may contain secrets.

### Step 4 — Verify environment (optional but recommended)

Open `apps/api/.env` and confirm:

- `DATABASE_URL` is set (default for local dev: `file:./dev.db` under `apps/api` as used by Prisma scripts).  
- `JWT_SECRET` is at least **32 characters** (change the default for anything beyond local demo).

### Step 5 — Create the database tables

From the **repository root** (same folder as `package.json`):

```bash
npm run db:push
```

**Expected:** Prisma applies the schema; SQLite file `apps/api/dev.db` is created or updated.

### Step 6 — Load demo data

```bash
npm run db:seed
```

**Expected:** Demo users and sample data are inserted (see **Demo accounts** below).

### Step 7 — Start the API and the web app

```bash
npm run dev
```

**Expected:**

- Terminal shows the **API** listening on **http://localhost:4000** (or similar).  
- Terminal shows **Vite** on **http://localhost:5173**.  
- Leave this terminal **open** while testing.

### Step 8 — Open the application in a browser

1. Go to **http://localhost:5173** (not only port 4000).  
2. The dev server proxies `/api` to the backend so you stay on one origin during development.  
3. Register a new user **or** sign in with a **demo account** (after seed).

### Step 9 — Stop the servers

In the terminal where `npm run dev` is running, press **Ctrl+C**.

---

## Demo accounts (after `npm run db:seed`)

| Role      | Email              | Password         |
|-----------|--------------------|------------------|
| Patient   | `patient@demo.local`   | `DemoRw2026!` |
| Clinician | `clinician@demo.local` | `DemoRw2026!` |
| Lab       | `lab@demo.local`       | `DemoRw2026!` |
| Admin     | `admin@demo.local`     | `DemoRw2026!` |

---

## npm scripts (reference)

| Command           | What it does |
|-------------------|--------------|
| `npm install`     | Installs all workspace packages. |
| `npm run setup`   | Creates `apps/api/.env` from `.env.example` if missing. |
| `npm run db:push` | Applies Prisma schema to SQLite. |
| `npm run db:seed` | Seeds demo users and data. |
| `npm run dev`     | Runs API + Vite together. |
| `npm run build`   | Production build (API + frontend). |

---

## Production build (local check)

```bash
npm run build
```

Produces `apps/api/dist/` and `apps/web/dist/`. For deployment, serve the API and static files per your host (cookie auth works best when the UI and `/api` share the same site origin).

---

## Email (optional, local dev)

To send real email (e.g. password reset), set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, etc. in **`apps/api/.env`**. See **`apps/api/.env.example`**. If SMTP is not configured, the API typically **logs** email content to the **API terminal** in development.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| `npm install` fails | Use Node.js **20+**; run from repo root. |
| Config / JWT errors | Ensure `apps/api/.env` exists and `JWT_SECRET` is ≥ 32 characters. |
| `db:push` fails | Run from repo root; check `DATABASE_URL` in `apps/api/.env`. |
| Blank page or API errors | Confirm **both** processes from `npm run dev` are running; use **http://localhost:5173**. |
| Emails not received | Configure SMTP or read the API console logs. |

---

## Submission checklist (course)

Use this **Google Doc** (name: **`personNames_[Summative]_[MMDDYYYY]`**) and include:

| Item | Action |
|------|--------|
| Video | Paste link to your **demo video** (5–10 min). |
| GitHub | Paste link to this **public** repository. |
| README | This file explains **every step** to run the project locally (see above). |
| SRS | Paste a **working link** to your SRS document. |
| Live app | Paste a **publicly accessible URL** to the deployed product (test in an incognito window). |
| Access | Share the Google Doc so **anyone with the link can view**; **test every link** before submitting. |

**Submit the Google Doc link on Canvas by the deadline stated in your course (e.g. **28 March 2026**).** Broken or inaccessible links may receive **no credit** for those items—verify each link after publishing.

---

## Repository layout

| Path | Purpose |
|------|---------|
| `apps/web` | React + Vite + Tailwind PWA |
| `apps/api` | Express + Prisma + SQLite |
| `packages/shared` | Shared TypeScript types |

---

## Security

- Never commit `apps/api/.env` or production secrets.  
- Use HTTPS and `COOKIE_SECURE=true` in production.

---

## License

Academic / educational use unless your institution specifies otherwise.
