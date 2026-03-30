# RW-Health Passport — A Web-Based Platform for Health Records and Laboratory Results (Rwanda)

**Repository:** [github.com/kbelyse/RW-Health](https://github.com/kbelyse/RW-Health) · **Live app:** [rw-health.onrender.com](https://rw-health.onrender.com/) · **SRS (Google Doc):** [open document](https://docs.google.com/document/d/19RksatWQPfJONQPQNpZ_BXnrMslHZHepvUOEkU6mMNQ/edit)

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

Optional: to run a **production build** on your machine after `npm run build`, use `npm run start:prod` from the repo root. For real outbound email (e.g. password reset), set SMTP variables in `apps/api/.env` as described in `apps/api/.env.example`; otherwise the API logs message content in the terminal.

---

## Repository layout & security

| Path | Role |
|------|------|
| `apps/web` | React + Vite + Tailwind PWA |
| `apps/api` | Express + Prisma + SQLite |
| `packages/shared` | Shared TypeScript types |

Never commit `apps/api/.env` or other secrets.

Summative video (5–10 min): script and demo order in [`docs/video-presentation-script.md`](docs/video-presentation-script.md).

---