import { Fragment, useId, useState, type CSSProperties } from "react";
import { ChevronDown, ClipboardList, Shield, Stethoscope, UserPlus, Zap, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const BK = "#0059B3";
export type FlowJourneyStep = {
    id: string;
    step: string;
    accent: string;
    label: string;
    title: string;
    summary: string;
    items: Array<{
        title: string;
        description: string;
        icon: LucideIcon;
    }>;
};
const STEPS: FlowJourneyStep[] = [
    {
        id: "join",
        step: "01",
        accent: BK,
        label: "Join",
        title: "Sign in to the right workspace",
        summary: "Create an account and pick a role: patient, clinician, lab, or admin. Each role opens a tailored dashboard, not a generic screen.",
        items: [
            {
                title: "Role-based routing",
                description: "After login you land where your permissions match your job, with no hunting through menus that do not apply.",
                icon: UserPlus,
            },
            {
                title: "Secure session",
                description: "HttpOnly cookies keep tokens off the client; sessions stay aligned with the API you already use in the demo.",
                icon: Shield,
            },
        ],
    },
    {
        id: "capture",
        step: "02",
        accent: "#0d7cc9",
        label: "Capture",
        title: "One timeline for care and results",
        summary: "Clinicians and labs append to the same longitudinal record: visits, labs, and referrals stay in one place instead of scattered PDFs.",
        items: [
            {
                title: "Shared record writes",
                description: "Structured entries from care and lab workflows reduce duplicate tests and conflicting summaries.",
                icon: ClipboardList,
            },
            {
                title: "Patient-readable history",
                description: "Patients see labs and visits in order, built for clarity when you demo continuity of care.",
                icon: Stethoscope,
            },
        ],
    },
    {
        id: "protect",
        step: "03",
        accent: "#E85D04",
        label: "Protect",
        title: "Rules, roles, and audit",
        summary: "Access follows role policies; sensitive actions leave an audit trail so trust scales beyond a single facility.",
        items: [
            {
                title: "Scoped visibility",
                description: "What you can open depends on role and relationship to the patient, mirrored in the API layer.",
                icon: Shield,
            },
            {
                title: "Audit-friendly events",
                description: "Designed so admins can reason about who did what, when, which matters for pilots and reviews.",
                icon: Shield,
            },
        ],
    },
    {
        id: "resilience",
        step: "04",
        accent: "#16a34a",
        label: "Resilience",
        title: "Offline-first where it matters",
        summary: "When connectivity drops, the PWA can queue actions and sync later, with fewer lost referrals and fewer frustrated users.",
        items: [
            {
                title: "Queue & retry",
                description: "Critical actions do not disappear when the network blips; they flush when you are back online.",
                icon: Zap,
            },
            {
                title: "Cached shell",
                description: "Core screens stay usable offline so demos still work on flaky conference Wi‑Fi.",
                icon: Zap,
            },
        ],
    },
];
export function HealthPassportJourney() {
    const [activeId, setActiveId] = useState(STEPS[0].id);
    const gid = useId().replace(/:/g, "");
    const gradId = `fj-grad-${gid}`;
    const active = STEPS.find((s) => s.id === activeId) ?? STEPS[0];
    const activeIndex = STEPS.findIndex((s) => s.id === activeId);
    const pathD = "M 60 200 C 180 90 240 70 320 120 C 380 150 420 210 500 195 C 580 180 640 100 720 125 C 800 150 860 200 940 175 C 1020 150 1080 120 1140 155";
    return (<div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-20 h-72 w-72 rounded-full bg-[#0059B3]/[0.06] blur-3xl" aria-hidden/>
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" aria-hidden/>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full border border-[#0059B3]/20 bg-[#0059B3]/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#0059B3]">
          End-to-end flow
        </span>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          From sign-in to trusted data
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
          The same four steps as <span className="font-semibold text-slate-800">Flow</span> below: tap a stage to see what
          it means in this demo.
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-14 max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="relative hidden min-h-[260px] lg:block">
          <svg className="absolute left-0 right-0 top-0 h-[260px] w-full overflow-visible" viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid meet" aria-hidden>
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0059B3"/>
                <stop offset="33%" stopColor="#0d7cc9"/>
                <stop offset="66%" stopColor="#E85D04"/>
                <stop offset="100%" stopColor="#16a34a"/>
              </linearGradient>
            </defs>

            <motion.path d={pathD} fill="none" stroke="url(#gradId)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="4 16" initial={{ pathLength: 0, opacity: 0.4 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ pathLength: { duration: 2.2, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.4 } }}/>

            
            <motion.path d={pathD} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 24" strokeOpacity="0.45" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}/>

            <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.6, duration: 0.35 }}>
              <motion.path d="M 1125 150 L 1145 155 L 1125 160 Z" fill="#0059B3" animate={{ opacity: [0.65, 1, 0.65] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}/>
            </motion.g>
          </svg>
        </div>

        
        <div className="relative flex flex-col gap-2 lg:-mt-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-4">
          {STEPS.map((m, idx) => {
            const isActive = activeId === m.id;
            const MainIcon = m.items[0].icon;
            return (<Fragment key={m.id}>
                <motion.button type="button" onClick={() => setActiveId(m.id)} layout whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className={`relative flex min-h-0 w-full flex-1 flex-col items-center rounded-2xl border text-center transition-shadow lg:min-w-0 ${isActive
                    ? "z-10 border-[#0059B3]/35 bg-white shadow-lg shadow-[#0059B3]/10 ring-2 ring-[#0059B3]/20"
                    : "border-slate-200/90 bg-white/90 shadow-sm hover:border-slate-300 hover:shadow-md"}`} style={{ "--accent": m.accent } as CSSProperties}>
                  <div className={`mt-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white ${isActive ? "ring-4 ring-[color:var(--accent)]/25" : ""}`} style={{ backgroundColor: m.accent }}>
                    <MainIcon className="h-6 w-6" strokeWidth={2}/>
                  </div>
                  <span className="mt-3 font-mono text-xs font-bold text-slate-400">Step {m.step}</span>
                  <span className="mt-1 px-2 font-display text-lg font-bold text-slate-900">{m.label}</span>
                  <p className="mt-2 line-clamp-3 px-3 pb-4 text-xs leading-snug text-slate-500">{m.title}</p>
                </motion.button>
                {idx < STEPS.length - 1 && (<div className="flex justify-center py-1 lg:hidden" aria-hidden>
                    <motion.div animate={{ y: [0, 5, 0], opacity: [0.45, 1, 0.45] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                      <ChevronDown className="h-7 w-7 text-[#0059B3]/60" strokeWidth={2.5}/>
                    </motion.div>
                  </div>)}
              </Fragment>);
        })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 mx-auto mt-12 max-w-3xl rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: active.accent }}>
              Step {active.step}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Maps to Flow · {activeIndex + 1} of {STEPS.length}
            </span>
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">{active.title}</h3>
          <p className="mt-3 text-slate-600">{active.summary}</p>
          <ul className="mt-8 space-y-5 border-t border-slate-100 pt-8">
            {active.items.map((item, i) => {
            const Ic = item.icon;
            return (<motion.li key={item.title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} className="flex gap-4 text-left">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: active.accent }}>
                    <Ic className="h-5 w-5" strokeWidth={2}/>
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                </motion.li>);
        })}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>);
}
