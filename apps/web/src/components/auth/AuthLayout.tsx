import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { RWHealthLogo } from "@/components/brand/RWHealthLogo";
import type { ReactNode } from "react";

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
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen lg:grid-cols-[minmax(280px,36%)_1fr] xl:grid-cols-[minmax(320px,34%)_1fr]">
        <aside className="relative hidden min-h-screen flex-col overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-b from-[#004a99] via-[#0059B3] to-[#003d7a]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_30%_0%,rgba(255,255,255,0.12),transparent_50%)]" />
          <div
            className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-white/60 via-white/40 to-transparent"
            aria-hidden
          />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col px-10 pb-12 pt-12 xl:px-12 xl:pt-14">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2 rounded-lg outline-none ring-offset-2 ring-offset-[#0059B3] transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <RWHealthLogo size="md" variant="dark" />
            </Link>

            <div className="flex min-h-0 flex-1 flex-col justify-center py-10">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/70">Secure access</p>
                <h2 className="mt-5 max-w-[20rem] font-display text-[1.65rem] font-bold leading-[1.2] tracking-tight text-white xl:text-3xl">
                  {heroTitle}
                </h2>
                <p className="mt-5 max-w-[19rem] text-[15px] leading-relaxed text-white/85">{heroSubtitle}</p>

                <div className="mt-10 border-t border-white/15 pt-8">
                  <div className="flex items-center gap-2.5 text-[13px] font-medium text-white/90">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                      <Lock className="h-4 w-4 text-white" strokeWidth={2} />
                    </span>
                    Role-aware access
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </aside>

        <div className="relative flex min-h-screen flex-col justify-center bg-white px-5 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="relative mb-8 flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 lg:hidden">
            <Link to="/" className="inline-block">
              <RWHealthLogo size="md" variant="light" />
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Secure</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mx-auto w-full max-w-xl"
          >
            {children}

            <p className="mt-10 text-center text-sm text-slate-500">
              <Link to="/" className="font-medium text-slate-600 transition hover:text-[#0059B3]">
                ← Back to home
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
