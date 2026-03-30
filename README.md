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

## Email (SMTP) — step by step

The API sends mail for things like **password reset**, **welcome**, and **appointment/lab notifications**. You can run without SMTP (emails are **printed in the API terminal**), or configure real delivery.

### When SMTP is *not* set

If `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASS` is empty, the API **does not** connect to a mail server. It **logs** each message (recipient, subject, HTML preview) in the terminal where the API runs. Use that to test flows without Gmail.

### When you want real email

1. Open **`apps/api/.env`** (create it with `npm run setup` if needed — it is **not** committed to Git).
2. Set these variables (all three **`SMTP_HOST`**, **`SMTP_USER`**, **`SMTP_PASS`** must be non-empty for real sending):

| Variable | Meaning |
|----------|---------|
| `SMTP_HOST` | Your provider’s SMTP server (e.g. `smtp.gmail.com`). |
| `SMTP_PORT` | Usually **`587`** (STARTTLS) or **`465`** (SSL). |
| `SMTP_USER` | Login — often your full email address. |
| `SMTP_PASS` | App password or SMTP password (see Gmail below). |
| `SMTP_FROM` | “From” line, e.g. `"RW-Health Passport <you@gmail.com>"`. |
| `SMTP_SECURE` | **`false`** for port **587** · **`true`** for port **465** (typical). |

3. **Save** the file.
4. **Restart** the API (stop `npm run dev` with `Ctrl+C`, run `npm run dev` again).

### Gmail (recommended for demos)

1. Open [Google Account](https://myaccount.google.com/) → **Security**.  
2. Turn on **2-Step Verification** (required for app passwords).  
3. **Security** → **App passwords** → create one (e.g. “Mail” / “Other”) → copy the **16-character** password.  
4. In **`apps/api/.env`** set (replace with your email):

   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your.email@gmail.com
   SMTP_PASS=xxxxxxxxxxxxxxxx
   SMTP_FROM="RW-Health Passport <your.email@gmail.com>"
   SMTP_SECURE=false
   ```

5. Use the **app password** as `SMTP_PASS`, not your normal Gmail password.  
6. Restart the API and test (e.g. **Forgot password** on the login page).

### How to test

- With SMTP: submit **Forgot password** with a real inbox you control; check spam if needed.  
- Without SMTP: watch the **terminal running the API** for the logged “email” and reset token.

Full copy-paste examples and notes are in **`apps/api/.env.example`**.

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

## Going live (hosting)

This app uses **cookie-based login** and **`/api` on the same site** as the UI. The intended setup is **one process**: the Express API serves the **built** React app from disk and handles `/api/*`.

### 1. Build locally (sanity check)

From the **repository root**:

```bash
npm install
npm run build
```

You should get `apps/api/dist/` and `apps/web/dist/`.

### 2. Run production mode locally (optional test)

From **`apps/api`** (after `npm run build`, and with **`apps/api/.env`** present — same as dev):

**Linux / macOS:**

```bash
cd apps/api
NODE_ENV=production WEB_DIST=../web/dist node dist/index.js
```

**Windows CMD** (from `apps\api`):

```bat
set NODE_ENV=production
set WEB_DIST=..\web\dist
node dist\index.js
```

Open **http://localhost:4000** — the SPA and API share one origin.  
(Adjust **PORT** if 4000 is busy.)

### 3. What the host needs

Set these in the platform’s **environment / secrets** (never commit real values):

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | Often injected by the host (e.g. `$PORT` on Railway/Render) — your API already reads `PORT`. |
| `JWT_SECRET` | Long random string (≥ 32 chars). |
| `DATABASE_URL` | e.g. `file:./prod.db` — use a **persistent disk** so SQLite survives restarts. |
| `COOKIE_SECURE` | `true` when the site is **HTTPS**. |
| `CORS_ORIGIN` | Your **public** app URL, e.g. `https://your-app.onrender.com` |
| `WEB_DIST` | Path from **`apps/api`** working directory to the built web app: typically **`../web/dist`** if the start command runs inside `apps/api`. |
| `SMTP_*` | Optional; same as local if you want real email in production. |

After deploy, run **Prisma** against production DB once (many hosts offer a one-off shell):

```bash
cd apps/api && npx prisma db push
```

Then seed if you need demo users (optional for grading).

### 4. Typical platforms

- **Render** — Web Service: connect GitHub repo, build `npm install && npm run build`, start command from `apps/api` as above; add a **persistent disk** and point `DATABASE_URL` at a file on that disk.  
- **Railway** — Similar: set env vars, attach volume for SQLite, use their **$PORT**.  
- **Fly.io** — `fly launch`, Dockerfile or buildpack, volume for `prod.db`.

Exact clicks change over time—use each platform’s “Node monorepo” or “Express static files” guides and keep **one** public **HTTPS** URL.

### 5. Before you submit

- Open your **live URL** in an **incognito/private** window (no stale cookies).  
- Confirm **login**, **main flows**, and that the **Google Doc links** (video, repo, SRS, live app) all work for **anyone with the link**.

---

## Recording the demo video (5–10 minutes)

Your course usually wants: **what the system is**, **problem**, **why it matters**, **solution**, **live demo**, and alignment with **SRS / system design**.

**Tools (pick one):**

- **OBS Studio** (free, Windows/macOS/Linux) — screen + microphone.  
- **Windows**: `Win + G` → Xbox Game Bar → capture.  
- **macOS**: QuickTime Screen Recording.  
- **Loom** / **Zoom** (local record) — easy if you already use them.

**Suggested flow:**

1. **20–30 s** — Introduce yourself and the project name (RW-Health Passport).  
2. **1–2 min** — Problem + why it matters + proposed solution (can match your SRS wording).  
3. **5–7 min** — **Live demo** on your **deployed URL** (or localhost only if the rubric allows—prefer **public URL** for the “deployment” criterion):  
   - Register / login (or demo accounts).  
   - Patient flows (records, labs, appointments as implemented).  
   - Clinician / admin / lab flows if required by your SRS.  
4. **30 s** — How the prototype reflects **SRS** and **actors/processes** (short, concrete).  
5. **End** — Thank you + where to find code (GitHub) and doc.

**Quality tips:**

- **Quiet room**, good mic; speak clearly.  
- **1920×1080** or **1280×720**, readable browser zoom (100–110%).  
- **Rehearse once** to stay under the time limit.  
- Upload to **YouTube** (Unlisted) or **Google Drive** (anyone with link can view), then **paste that link** in your Google Doc and **test it signed out / incognito**.

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
