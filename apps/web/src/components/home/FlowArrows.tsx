import { motion } from "framer-motion";
export function FlowArrows({ className = "" }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 320 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <motion.path d="M8 24h280" stroke="url(#fa)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 8" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}/>
      <motion.path d="M296 16l12 8-12 8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 0.35 }}/>
      <defs>
        <linearGradient id="fa" x1="0" y1="0" x2="320" y2="0">
          <stop stopColor="#93c5fd"/>
          <stop offset="1" stopColor="#1d4ed8"/>
        </linearGradient>
      </defs>
    </svg>);
}
export function VerticalSpark({ className = "" }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 120" fill="none" aria-hidden>
      <motion.path d="M12 4v112" stroke="url(#vs)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 8" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: "easeOut" }}/>
      <defs>
        <linearGradient id="vs" x1="12" y1="4" x2="12" y2="116">
          <stop stopColor="#bfdbfe"/>
          <stop offset="1" stopColor="#1e40af"/>
        </linearGradient>
      </defs>
    </svg>);
}
