import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RWHealthLogo } from "@/components/brand/RWHealthLogo";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

const bullets = [
  "Role-based dashboards for patients, clinicians, labs, and admins.",
  "Secure sessions with httpOnly cookies—no tokens in the browser.",
  "Offline-friendly: queue mutations when connectivity drops.",
];

export function AuthLayout({
  heroTitle,
  heroSubtitle,
  children,
}: {
  heroTitle: string;
  heroSubtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-100/80">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-slate-950 lg:flex lg:flex-col lg:justify-between lg:border-r lg:border-white/10 lg:p-10 xl:p-12">
          <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="relative">
            <Link to="/" className="inline-block">
              <RWHealthLogo size="md" variant="dark" />
            </Link>
            <h2 className="mt-10 max-w-sm font-display text-3xl font-bold leading-tight text-white xl:text-4xl">
              {heroTitle}
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-brand-100/95">{heroSubtitle}</p>
          </div>
          <ul className="relative mt-12 space-y-4">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3 text-sm text-brand-50/95">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="relative mt-10 text-xs text-brand-200/80">
            Academic demonstration · Not an official government system.
          </p>
        </div>
        <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="mb-8 lg:hidden">
              <Link to="/">
                <RWHealthLogo size="md" />
              </Link>
            </div>
            <div className="border border-slate-200/90 bg-white p-8 sm:p-10">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
