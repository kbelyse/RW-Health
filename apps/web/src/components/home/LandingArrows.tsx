import { useId } from "react";
import { motion } from "framer-motion";
export function SectionArrowDown({ className = "" }: {
    className?: string;
}) {
    const gid = useId().replace(/:/g, "");
    const gradId = `sad-grad-${gid}`;
    return (<div className={`pointer-events-none flex justify-center ${className}`}>
      <svg className="h-14 w-24 text-brand-500 md:h-20 md:w-32" viewBox="0 0 120 80" fill="none" aria-hidden>
        <path d="M60 8v44c0 12 8 20 20 20h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.35"/>
        <motion.path d="M60 8v44c0 12 8 20 20 20h8" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}/>
        <path d="M80 68l10-6-10-6" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <defs>
          <linearGradient id={gradId} x1="60" y1="8" x2="88" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee"/>
            <stop offset="1" stopColor="#2563eb"/>
          </linearGradient>
        </defs>
      </svg>
    </div>);
}
export function ArrowConnectorRight({ className = "" }: {
    className?: string;
}) {
    const gid = useId().replace(/:/g, "");
    const gradId = `acr-${gid}`;
    return (<svg className={`h-8 w-full max-w-[4rem] shrink-0 text-cyan-500/80 md:max-w-[5rem] ${className}`} viewBox="0 0 80 32" fill="none" aria-hidden>
      <motion.path d="M4 16h52" stroke={`url(#${gradId})`} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}/>
      <path d="M52 10l14 6-14 6" stroke={`url(#${gradId})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <defs>
        <linearGradient id={gradId} x1="4" y1="16" x2="66" y2="16">
          <stop stopColor="#22d3ee"/>
          <stop offset="1" stopColor="#2563eb"/>
        </linearGradient>
      </defs>
    </svg>);
}
