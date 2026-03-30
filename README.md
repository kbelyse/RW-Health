# RW-Health Passport — A Web-Based Platform for Health Records and Laboratory Results

**Repository:** [github.com/kbelyse/RW-Health](https://github.com/kbelyse/RW-Health) 

**Live app:** [rw-health.onrender.com](https://rw-health.onrender.com/) 

**SRS (Google Doc):** [open document](https://docs.google.com/document/d/19RksatWQPfJONQPQNpZ_BXnrMslHZHepvUOEkU6mMNQ/edit)

---

## How to run locally

**Prerequisites:** Node.js **20+** (`node -v`), Git (`git --version`), npm (`npm -v`).

1. **Clone**  
   `git clone https://github.com/kbelyse/RW-Health.git`  
   `cd RW-Health`

2. **Install**  
   `npm install`

3. **Env file**  
   `npm run setup`  
   Creates `apps/api/.env` from `.env.example`.

4. **Check** `apps/api/.env`: `DATABASE_URL` is set; `JWT_SECRET`

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

### Demo accounts (after `npm run db:seed`) — these exist only after you run seed on that database (local `dev.db` vs production are different files)

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
| `apps/web` | React + Vite + Tailwind |
| `apps/api` | Express + Prisma + SQLite |
| `packages/shared` | Shared TypeScript types |

---

| Setting | Value |
|--------|--------|
| Root directory | *(monorepo root)* |
| Build command | `npm run build:render` |
| Start command | `npm run start:prod` |

**Production SQLite:** On hosts with an **ephemeral filesystem** (e.g. Render free web services), the database file can be **wiped on deploy or when the instance restarts**—accounts and data disappear even though the app “worked” earlier. For durable data, use a **managed database** (e.g. Render Postgres) and point `DATABASE_URL` at it, or attach **persistent disk** if you stay on SQLite.
