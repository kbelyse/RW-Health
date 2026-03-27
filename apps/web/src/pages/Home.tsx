import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  ClipboardList,
  FlaskConical,
  Globe2,
  HeartPulse,
  LayoutDashboard,
  Lock,
  Shield,
  Sparkles,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import { RWHealthLogo } from "@/components/brand/RWHealthLogo";

const IMG = {
  hero: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2400&q=70",
  team: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1600&q=70",
};

const btnHeroPrimary =
  "inline-flex min-h-[52px] min-w-[180px] items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-brand-950 shadow-lg shadow-brand-950/20 transition hover:bg-brand-50";
const btnHeroGhost =
  "inline-flex min-h-[52px] min-w-[180px] items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/** Plain-language labels for what the system actually does (no stack jargon). */
const PLATFORM_PILLS = [
  { icon: UserPlus, label: "Sign up & login" },
  { icon: Lock, label: "Secure sessions" },
  { icon: ClipboardList, label: "Health records" },
  { icon: FlaskConical, label: "Lab results" },
  { icon: CalendarClock, label: "Referrals & visits" },
  { icon: LayoutDashboard, label: "Admin stats" },
  { icon: Shield, label: "Who did what (audit)" },
  { icon: Globe2, label: "Ready for two languages" },
] as const;

export function Home() {
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <div className="relative overflow-hidden bg-slate-50">
      {/* —— Hero —— */}
      <section id="hero" className="relative min-h-[62vh]">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="" className="h-full w-full object-cover object-center" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950/97 via-slate-950/90 to-slate-950/95" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_80%_0%,rgba(59,130,246,0.25),transparent_50%)]" />
        </div>
        <div className="relative mx-auto flex min-h-[62vh] max-w-6xl flex-col justify-center px-4 py-10 md:px-6 lg:py-12">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp}>
                <RWHealthLogo size="lg" variant="dark" />
              </motion.div>
              <motion.div
                custom={1}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-100"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                Rwanda · One health passport
              </motion.div>
              <motion.h1
                custom={2}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
              >
                Your care story,{" "}
                <span className="bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent">
                  verified & connected
                </span>
              </motion.h1>
              <motion.p
                custom={3}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="mt-5 max-w-lg text-base leading-relaxed text-brand-100/95"
              >
                Patients, doctors, and labs share one place—less repeat work, clearer next steps.
              </motion.p>
              <motion.div
                custom={4}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link to="/register" className={btnHeroPrimary}>
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#platform" className={btnHeroGhost}>
                  See what’s inside
                </a>
              </motion.div>
              <motion.div
                custom={5}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="mt-10 border-t border-white/15 pt-8"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-200/95">
                  What you get
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PLATFORM_PILLS.map((p, i) => (
                    <motion.span
                      key={p.label}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.04 }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
                    >
                      <p.icon className="h-3.5 w-3.5 shrink-0 text-sky-200" />
                      {p.label}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-sky-400/40 via-transparent to-brand-600/30 blur-xl" />
                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/20 bg-slate-900/60 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-white/10 bg-gradient-to-r from-brand-600/50 to-slate-900/80 px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-100/90">
                      Live workspace
                    </p>
                    <p className="mt-1 text-sm text-white/90">Records · labs · visits · admin</p>
                  </div>
                  <div className="relative aspect-[4/5] max-h-[380px] sm:max-h-[420px]">
                    <img
                      src={IMG.team}
                      alt="Healthcare professionals"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="font-display text-lg font-bold text-white">Built to run</p>
                      <p className="mt-1 text-sm text-brand-100/90">
                        Real flows, not a slide deck—try it end to end.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* —— Angled band —— */}
      <section className="relative -mt-6 skew-y-0 bg-gradient-to-r from-brand-600 via-brand-700 to-slate-900 py-10 text-white shadow-xl lg:py-12">
        <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
          <p className="font-display text-xl font-bold leading-snug md:text-2xl">
            One place for patients, clinicians, labs, and admins—online or queued when you’re offline.
          </p>
        </div>
      </section>

      {/* —— Platform bento —— */}
      <section id="platform" className="scroll-mt-20 bg-slate-50 py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-600">Platform</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
                Everything in one place
              </h2>
            </div>
            <p className="mt-4 max-w-md text-sm text-slate-600 md:mt-0 md:text-right">
              Simple words: sign up, sign in safely, then see your story grow.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-12 md:grid-rows-2 md:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-12 flex flex-col justify-between rounded-3xl bg-slate-900 p-8 text-white md:col-span-7 md:min-h-[220px]"
            >
              <HeartPulse className="h-10 w-10 text-sky-400" />
              <div>
                <h3 className="font-display text-2xl font-bold">Patients</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Visits, labs, and appointments in one timeline.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="col-span-12 rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-sm md:col-span-5"
            >
              <Stethoscope className="h-9 w-9 text-brand-600" />
              <h3 className="mt-4 font-display text-xl font-bold text-slate-900">Clinicians</h3>
              <p className="mt-2 text-sm text-slate-600">Find patients, note visits, book follow-ups.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="col-span-12 rounded-3xl bg-gradient-to-br from-brand-50 to-sky-50 p-8 md:col-span-4"
            >
              <FlaskConical className="h-9 w-9 text-brand-700" />
              <h3 className="mt-4 font-display text-xl font-bold text-slate-900">Labs</h3>
              <p className="mt-2 text-sm text-slate-700">Structured results only—no random uploads.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="col-span-12 rounded-3xl border border-dashed border-slate-300 bg-slate-100/80 p-8 md:col-span-4"
            >
              <Building2 className="h-9 w-9 text-slate-600" />
              <h3 className="mt-4 font-display text-xl font-bold text-slate-900">Admins</h3>
              <p className="mt-2 text-sm text-slate-600">Usage counts and audit signals at a glance.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="col-span-12 flex items-center justify-between rounded-3xl bg-white p-8 ring-1 ring-slate-200 md:col-span-4"
            >
              <div>
                <Globe2 className="h-9 w-9 text-brand-600" />
                <h3 className="mt-4 font-display text-xl font-bold text-slate-900">Languages</h3>
                <p className="mt-2 text-sm text-slate-600">UI structure ready for bilingual rollout.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* —— Flow: numbered rail —— */}
      <section id="flow" className="border-y border-slate-200/90 bg-white py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-600">How it flows</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Four beats</h2>
            </div>
            <p className="text-sm text-slate-600">Short path from sign-in to trusted data.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              { n: "01", t: "Join", d: "Sign up and land in the right role." },
              { n: "02", t: "Add", d: "Clinicians and labs write to your record." },
              { n: "03", t: "Protect", d: "Rules and logs keep access honest." },
              { n: "04", t: "Stay online", d: "Queue actions when the network drops." },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i }}
                className="relative rounded-2xl border-t-4 border-brand-500 bg-slate-50 px-5 pb-6 pt-8"
              >
                <span className="font-display text-4xl font-bold text-brand-200">{step.n}</span>
                <p className="mt-3 font-display text-lg font-bold text-slate-900">{step.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* —— Timeline: horizontal cards —— */}
      <section id="journey" className="scroll-mt-20 bg-slate-50 py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">Why now</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            National digitization and shared truth between facilities—this demo fits that direction.
          </p>
          <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {[
              { y: "2024", t: "More care online", d: "Digital tools spread across districts." },
              { y: "2025", t: "Systems must talk", d: "Labs and clinics need the same facts." },
              { y: "2026", t: "Patient-first layer", d: "Passport, roles, audit, offline-ready PWA." },
            ].map((row, i) => (
              <motion.div
                key={row.y}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i }}
                className="relative min-w-[85vw] shrink-0 snap-center rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/80 md:min-w-0"
              >
                <span className="font-display text-5xl font-bold text-brand-100">{row.y}</span>
                <p className="mt-3 font-display text-lg font-bold text-slate-900">{row.t}</p>
                <p className="mt-2 text-sm text-slate-600">{row.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* —— Mission: split —— */}
      <section id="mission" className="scroll-mt-20 bg-white">
        <div className="mx-auto grid max-w-6xl gap-0 md:grid-cols-2">
          <div className="flex flex-col justify-center bg-gradient-to-br from-brand-700 to-slate-900 px-6 py-14 text-white md:px-12 md:py-20">
            <p className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Continuity beats paperwork.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-brand-100/90">
              Help people carry their health story with less friction—aligned with Rwanda’s digital
              health direction. Academic demo, not a government product.
            </p>
          </div>
          <div className="flex flex-col justify-center border-t border-slate-200/90 bg-slate-50 px-6 py-14 md:border-t-0 md:border-l md:px-12 md:py-20">
            <ul className="space-y-5 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                Fewer duplicate tests when everyone sees the same history.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                Clear rules for who can see what.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                Works on shaky networks—actions queue until you’re back.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* —— CTA —— */}
      <section id="cta" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-950" />
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <img src={IMG.hero} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-20">
          <RWHealthLogo size="lg" variant="dark" />
          <h2 className="mx-auto mt-8 max-w-xl font-display text-3xl font-bold text-white md:text-4xl">
            Try the full path
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-brand-100/95">
            Create an account or sign in—see your workspace in seconds.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-brand-950 transition hover:bg-brand-50"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-full border border-white/40 px-8 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
