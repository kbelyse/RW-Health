import { motion } from "framer-motion";

function IconLab() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
      <rect x="8" y="10" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M16 18h16M16 24h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="30" r="3" fill="currentColor" />
    </svg>
  );
}

function IconNetwork() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
      <circle cx="24" cy="14" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="34" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="36" cy="34" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M16 32l8-8-8-8M32 32l-8-8 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
      <path
        d="M24 8l14 6v10c0 9-6 17-14 20-8-3-14-11-14-20V14l14-6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M18 24l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSync() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
      <path
        d="M14 20a10 10 0 0116-8l2-3v4h-4M34 28a10 10 0 01-16 8l-2 3v-4h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
  );
}

const items = [
  {
    Icon: IconLab,
    title: "Structured results",
    desc: "Codes, values, units, and reference ranges in one payload.",
  },
  {
    Icon: IconNetwork,
    title: "Multi-site graph",
    desc: "Patients, facilities, and labs linked by search—not silos.",
  },
  {
    Icon: IconShield,
    title: "Trust layer",
    desc: "RBAC, sessions, and audit trails for every sensitive read/write.",
  },
  {
    Icon: IconSync,
    title: "Offline sync",
    desc: "Queue mutations when the link drops; flush when you are back.",
  },
];

export function CapabilityIconGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 * i, duration: 0.45 }}
          className="group flex flex-col border border-slate-200/90 bg-white p-4 transition hover:border-brand-300/80 hover:bg-brand-50/40"
        >
          <div className="flex h-14 w-14 items-center justify-center border border-slate-200/80 bg-slate-50 text-brand-700 transition group-hover:border-brand-200 group-hover:bg-white">
            <item.Icon />
          </div>
          <p className="mt-3 font-display text-sm font-semibold text-slate-900">{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
