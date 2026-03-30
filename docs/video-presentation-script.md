# Summative video — presentation script (5–10 minutes)

**Target length:** about **7 minutes** (stay within 5–10). Speak clearly; you can paraphrase, but this text is written to read aloud.

**Before you record:** Open your deployed site in a normal browser window. If you want to stay logged in while switching roles, avoid incognito; if you prefer a clean session each time, use incognito and log in fresh for each segment. Have demo passwords ready, close extra tabs, and silence notifications.

**Demo URL:** https://rw-health.onrender.com (or say “my public deployment” if the link changes).

---

## Part A — Introduction (about 1 minute)

### What to say — opening

Good [morning / afternoon]. In this video I present **RW-Health Passport**, a web-based digital health passport designed for Rwanda’s context. It brings patient health records, laboratory results, and scheduling together in one place.

Technically, the system is a React progressive web app with an Express API, Prisma and SQLite for data, and cookie-based authentication. What you will see is a **demonstration prototype** aligned with my Software Requirements Specification. It is **not** a certified medical device; it is meant to show how the ideas work end to end.

### What to say — problem and solution

In Rwanda, medical and laboratory information is often **fragmented** across facilities. National systems such as e-Ubuzima are not rolled out evenly everywhere, and many patients still do not have one seamless digital view of their care. When information is split across sites, clinicians may not see the full picture, patients repeat their story and repeat tests, and laboratories cannot always tie results back to the rest of the care journey. That hurts continuity of care and wastes time and resources.

**RW-Health Passport** responds to that gap. It offers **role-based access** for patients, clinicians, laboratory staff, and administrators, with unified views for records and labs, workflows for appointments, and administrative oversight. The prototype you will see runs on a **single public URL**, so the full story can be demonstrated in one session.

This build reflects the **functional requirements** in my SRS: secure authentication, role-based access, patient visibility of records and labs, clinician documentation, lab uploads, appointment-related flows, and administrative visibility. It also reflects my **system design**: the main actors are patient, clinician, laboratory staff, and administrator. I will walk through each role on screen so you can see how the processes fit together.

---

## Part B — Live demonstration (about 4–6 minutes)

Follow this order: **entry and patient → clinician → laboratory → administrator**. After each role, **log out** before the next login so the audience sees a clear switch between roles.

### Before you start talking

- Go to `https://rw-health.onrender.com`.
- Set the browser zoom to about **100%** so text is easy to read in the recording.

---

### Segment 1 — Patient (about 1.5–2 minutes)

**Say:** I will begin as a **patient**, because the mission of this project is centered on the person’s continuity of care.

**Do:**

1. If you are not logged in, open **Login** or **Register**. You may add one line: “New users can register; I will use the seeded demo patient account.”
2. Sign in as the demo **patient** (`patient@demo.local` / `DemoRw2026!`). You can say “the demo patient account” if you prefer not to read the email aloud.
3. After login, you should land on the **dashboard** or **overview**. Point to any summary cards or counts if they appear.
4. Open **Records** (Dashboard → Medical records). Scroll a little to show a list of health records.
5. Open **Labs** (Dashboard → Lab results). Show lab entries; if a download or file appears, say that patients can access structured results and attached reports where the lab uploaded a file.
6. Open **Appointments** (Dashboard → Appointments). Show requested or scheduled items if they exist.
7. If time allows, open **Care team** briefly; otherwise skip it.

**Say while you click:** Here the patient sees their own journey in one place—records, labs, and appointments—which matches my SRS emphasis on patient visibility and continuity.

**Then:** **Log out.**

---

### Segment 2 — Clinician (about 1.5–2 minutes)

**Say:** Next I show the **clinician**, who needs patient context across encounters—not only what sits in one facility’s file.

**Do:**

1. Log in as the demo **clinician** (`clinician@demo.local` / `DemoRw2026!`).
2. Open **Patients** or **Patient directory** (Dashboard → Patient chart). Show search or the list.
3. Open **one patient** to reach the **patient chart** (the URL may include `/dashboard/patients/` followed by an id). Show visit records or chart sections.
4. If your build lets you **create** a record from this view, show the action briefly—open the form and save if you are comfortable, or say you are showing the flow without saving if you prefer not to change data.
5. Open **Appointments** as the clinician. Scroll to show clinician-specific items such as slots or requests, if your UI shows them.

**Say while you click:** This matches the clinician actor in my design: find or select a patient, review history, and support scheduling as described in the SRS.

**Then:** **Log out.**

---

### Segment 3 — Laboratory (about 1 minute)

**Say:** **Laboratory staff** need a clear way to attach results to the correct patient.

**Do:**

1. Log in as the demo **lab** user (`lab@demo.local` / `DemoRw2026!`).
2. Go to **Upload** (Dashboard → Upload). Show the form for uploading or entering lab results; mention file attachment if the UI shows it.
3. If you choose not to submit, say: “In production this would save to the database; here I am showing the interface.”

**Say:** This corresponds to the lab actor and to the SRS requirement for integrating laboratory results.

**Then:** **Log out.**

---

### Segment 4 — Administrator (about 45–60 seconds)

**Say:** Finally, **administrators** need oversight for accountability and planning.

**Do:**

1. Log in as the demo **admin** (`admin@demo.local` / `DemoRw2026!`).
2. Open **Admin** or **Operations** (Dashboard → Operations or Admin). Show **statistics** such as users by role, and any **audit** or activity list if your build includes it.

**Say:** This covers the administrative oversight part of my requirements and shows traceability in the prototype.

**Then:** **Log out** (optional; logging out ends the demo cleanly).

---

## Part C — Closing (about 45 seconds)

**Say:**

In summary, RW-Health Passport shows a single web layer where patients, clinicians, laboratory staff, and administrators each see what they need. The problem I addressed was fragmentation and weak continuity of information; the solution is role-based access to records, labs, and scheduling in one deployable prototype. What you saw aligns with my SRS and with the actors and processes in my system design. The source code and setup instructions are in my public GitHub repository, and the SRS is linked in my submission document. Thank you for watching.

**Stop recording.**

---

## Checklist before you upload

- [ ] Total length is between **5 and 10 minutes** (rehearse once with a timer).
- [ ] You covered: **what the system is**, **the problem**, **why it matters**, **your solution**, **live demo**, **SRS alignment**, and **actors / processes**.
- [ ] Audio is clear and the screen is readable.
- [ ] Your submission document includes the **video link** and sharing is set so **anyone with the link can view**.

---

## If something breaks while recording

Stay calm. Say something like: “In a full deployment, this action would …” and move to the next screen. Do not spend more than a minute or two retrying a single step; staying within ten minutes matters more than one perfect click.
