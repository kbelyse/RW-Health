import { motion } from "framer-motion";
type Props = {
    className?: string;
    size?: "sm" | "md" | "lg";
    showWordmark?: boolean;
    variant?: "light" | "dark";
};
const sizes = {
    sm: { mark: 36, text: "text-base", sub: "text-[9px]" },
    md: { mark: 44, text: "text-lg", sub: "text-[10px]" },
    lg: { mark: 56, text: "text-xl", sub: "text-xs" },
};
export function RWHealthLogo({ className = "", size = "md", showWordmark = true, variant = "light", }: Props) {
    const s = sizes[size];
    const dark = variant === "dark";
    return (<div className={`flex items-center gap-2.5 ${className}`}>
      <motion.div whileHover={{ scale: 1.02 }} className="relative shrink-0" style={{ width: s.mark, height: s.mark }}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="rwlg" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6"/>
              <stop offset="1" stopColor="#1e3a8a"/>
            </linearGradient>
            <linearGradient id="rwlg2" x1="32" y1="18" x2="32" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff" stopOpacity="0.95"/>
              <stop offset="1" stopColor="#e0f2fe" stopOpacity="0.9"/>
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#rwlg)"/>
          <path d="M20 22h24v4H20v-4zm0 8h24v3H20v-3zm8 8v12" stroke="url(#rwlg2)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M32 38c4 0 7-2.5 7-6s-3-6-7-6-7 2.5-7 6 3 6 7 6z" stroke="url(#rwlg2)" strokeWidth="2" fill="none"/>
          <motion.circle cx="48" cy="18" r="3" fill="#93c5fd" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}/>
        </svg>
      </motion.div>
      {showWordmark && (<div className="min-w-0 leading-tight">
          <span className={`font-display font-semibold tracking-tight ${dark ? "text-white" : "text-brand-950"} ${s.text}`}>
            RW-Health
          </span>
          <span className={`block font-medium uppercase tracking-[0.2em] ${dark ? "text-brand-100/90" : "text-slate-500"} ${s.sub}`}>
            Passport
          </span>
        </div>)}
    </div>);
}
