# RW-Health Passport — A Web-Based Platform for Health Records and Laboratory Results (Rwanda)

**Repository:** [github.com/kbelyse/RW-Health](https://github.com/kbelyse/RW-Health) (public) · **Live app:** [rw-health.onrender.com](https://rw-health.onrender.com/) · **SRS (Google Doc):** [open document](https://docs.google.com/document/d/19RksatWQPfJONQPQNpZ_BXnrMslHZHepvUOEkU6mMNQ/edit) (share: *anyone with the link can view*)

---

## Mission

My mission is to **strengthen healthcare continuity in Africa** through digital systems that improve how individuals manage and share medical information. In **Rwanda**, patient health records remain fragmented across facilities and paper files. Rwanda is implementing **e‑Ubuzima**, but full adoption is incomplete: as of 2025, reporting ([AllAfrica, 2025](https://allafrica.com)) indicates that only about **45%** of health facilities were fully digitized, with infrastructure and training gaps affecting the remainder. **RW-Health Passport** will allow patients, laboratories, and clinicians to access verified medical records and laboratory results in one secure web platform, improving care quality and reducing unnecessary repeat tests.

---

## Hypothesis

If we implement **RW-Health Passport** as a focused web prototype with **role-based access** and core clinical and lab flows, then each primary actor (**patient**, **clinician**, **laboratory staff**, **administrator**) can complete their intended tasks in one continuous demonstration, and those outcomes can be **verified** on the **live deployment** ([rw-health.onrender.com](https://rw-health.onrender.com)) and in the **SRS**.

**SMART:** **S** — one system, four roles, flows in code and SRS; **M** — public HTTPS URL, 5–10 minute video, behavior matches requirements; **A** — React, Express, Prisma, SQLite, public repo, README steps; **R** — demonstration prototype, not national e‑Ubuzima integration or a certified device; **T** — summative deadline.

Full plain-text mission, problem, and expanded hypothesis (for your SRS) are in [`docs/mission-problem-hypothesis.md`](docs/mission-problem-hypothesis.md).

---

## Problem statement

In Rwanda, patients’ medical and laboratory records are **fragmented** across public and private health facilities, creating inefficiencies in care delivery. Reporting ([AllAfrica, 2025](https://allafrica.com)) cited that only **15 of Rwanda’s 30 districts** had fully implemented **e‑Ubuzima** at the time—**50% of districts** not yet at full implementation—**leaving over 50% of patients** without seamless digital access to their health information. That contributes to **duplicate laboratory tests**, **treatment delays**, and difficulty when patients seek care at multiple facilities.

**WHO:** Patients, healthcare providers, and laboratories in Rwanda. **WHAT:** Incomplete, inaccessible, or facility-bound records. **WHEN:** Consultations, referrals, lab testing, follow-ups. **WHERE:** Nationwide, especially where digital infrastructure is incomplete. **WHY:** Facility-centered tools, limited interoperability, and limited patient-controlled access weaken continuity. **HOW:** A web-based passport where verified labs and authorized clinicians contribute data and patients and clinicians access unified records within MVP scope.

---

## Proposed solution (this prototype)

**RW-Health Passport** is a **demonstration prototype** (not a certified medical device): role-based dashboards for **patient**, **clinician**, **lab**, and **admin**; authentication; health records; lab uploads including file attachments where implemented; appointments and clinician availability; patient search for staff; overview metrics; admin statistics and audit visibility. **Implementation:** React (Vite) PWA, Express API, Prisma and SQLite, cookie-based authentication; one deploy can serve the API and built SPA on the same origin. Full requirements and diagrams are in the **SRS**; optional FR wording is in [`docs/SRS-functional-requirements.md`](docs/SRS-functional-requirements.md).

---

## How to run locally (every step)

**Prerequisites:** Node.js **20+** (`node -v`), Git (`git --version`), npm (`npm -v`).

1. **Clone**  
   `git clone https://github.com/kbelyse/RW-Health.git`  
   `cd RW-Health`

2. **Install**  
   `npm install`

3. **Env file**  
   `npm run setup`  
   Creates `apps/api/.env` from `.env.example` if missing. **Do not commit** `apps/api/.env`.

4. **Check** `apps/api/.env`: `DATABASE_URL` is set; `JWT_SECRET` is at least **32 characters** for anything beyond a local throwaway demo.

5. **Database** (from repository root)  
   `npm run db:push`

6. **Seed demo data**  
   `npm run db:seed`

7. **Start dev servers**  
   `npm run dev`  
   API ≈ `http://localhost:4000`, web ≈ `http://localhost:5173`. Keep this terminal open.

8. **Browser**  
   Open **`http://localhost:5173`**. Register a user or sign in with a **demo account** below.

9. **Stop**  
   Press **Ctrl+C** in that terminal.

### Demo accounts (after `npm run db:seed`)

| Role | Email | Password |
|------|--------|----------|
| Patient | `patient@demo.local` | `DemoRw2026!` |
| Clinician | `clinician@demo.local` | `DemoRw2026!` |
| Lab | `lab@demo.local` | `DemoRw2026!` |
| Admin | `admin@demo.local` | `DemoRw2026!` |

### Commands (reference)

| Command | Purpose |
|---------|---------|
| `npm run build` | Production build (API + web). |
| `npm run build:render` | **Render** build command if deploy fails on TypeScript (`NODE_ENV=production` can skip devDependencies). |
| `npm run start:prod` | Run production API + static files from repo root (after `npm run build`). |

**Email (optional):** Set SMTP variables in `apps/api/.env` — see `apps/api/.env.example`. If SMTP is not configured, the API **logs** outgoing messages in the terminal (e.g. password-reset flow).

---

## Deploy (Render — this deployment)

- **Build command:** `npm run build:render`  
- **Start command:** `npm run start:prod`  
- **Root directory:** leave empty (monorepo root).  
- **Environment:** `JWT_SECRET`, `DATABASE_URL`, `COOKIE_SECURE=true`, `CORS_ORIGIN` = your public `https://…` URL (e.g. `https://rw-health.onrender.com`), optional `SMTP_*`.  
- After deploy: host **Shell** → `cd apps/api && npx prisma db push` (and `npm run db:seed` in that shell if you want demo users on the server).

---

## Submission (summative)

Create a **Google Doc** named **`personNames_[Summative]_[MMDDYYYY]`** and include **working** links to: your **video** (5–10 minutes), **this GitHub repo**, your **SRS**, and your **live app URL**. Set sharing to **anyone with the link can view**. Submit the **Google Doc link** on **Canvas** by your course deadline. **Test every link in an incognito window** — broken links may score zero for that item.

**Video should include:** description of the system, **problem statement**, **why it matters**, **proposed solution**, **live demo** (prefer the public URL), and how the prototype reflects the **SRS** and **system design** (actors and processes).

---

## Repository layout & security

| Path | Role |
|------|------|
| `apps/web` | React + Vite + Tailwind PWA |
| `apps/api` | Express + Prisma + SQLite |
| `packages/shared` | Shared TypeScript types |

Never commit secrets. Use **HTTPS** and `COOKIE_SECURE=true` in production.

---

## References (mission context)

- AllAfrica (2025). Rwanda: e‑Ubuzima adoption and health digitization progress — see SRS for full citation.  
- Rwanda Law No. 058/2021 on the Protection of Personal Data and Privacy — see SRS.

---
