import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ClipboardList, Shield, Sparkles, UserPlus, Zap, } from "lucide-react";
import { ActivitiesSlideshow, type ActivitySlide } from "@/components/home/ActivitiesSlideshow";
import { HeroBackdropSvgs } from "@/components/home/HomeSectionDecor";
import { HeroHealthIllustration } from "@/components/illustrations/HeroHealth";
const SCROLL_MT = "scroll-mt-[5.5rem]";
const IMG = {
    hero: "/images/hero-poster.jpg",
};
const ACTIVITY_SLIDES: ActivitySlide[] = [
    {
        src: "/images/activities/01-care-team.jpg",
        alt: "Healthcare professionals collaborating in a clinical setting",
    },
    {
        src: "/images/activities/02-hospital-interior.jpg",
        alt: "Bright hospital corridor and care environment",
    },
    {
        src: "/images/activities/03-clinical-space.jpg",
        alt: "Modern clinical space",
    },
    {
        src: "/images/activities/04-medical-tech.jpg",
        alt: "Medical equipment and technology in care delivery",
    },
];
const HERO_VIDEO = "/videos/hero-2560.mp4";
const HERO_VIDEO_FALLBACK = "/videos/hero-1080.mp4";
const FLOW_STEPS = [
    {
        id: "join",
        title: "Join",
        description: "Register and open the workspace that matches your role: patient, clinician, lab, or admin.",
        icon: UserPlus,
    },
    {
        id: "capture",
        title: "Capture",
        description: "Visits, labs, and referrals append to one longitudinal record instead of scattered files.",
        icon: ClipboardList,
    },
    {
        id: "protect",
        title: "Protect",
        description: "Role rules and audit trails so only the right people see the right data, when it matters.",
        icon: Shield,
    },
    {
        id: "resilience",
        title: "Resilience",
        description: "When connectivity fails, queue what you can and sync so the demo still works on poor Wi‑Fi.",
        icon: Zap,
    },
] as const;
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};
const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};
function HeroWave() {
    return (<div className="pointer-events-none absolute -bottom-px left-0 right-0 z-20">
      <svg className="h-14 w-full text-white md:h-[4.5rem]" preserveAspectRatio="none" viewBox="0 0 1440 120" aria-hidden>
        <path fill="currentColor" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"/>
      </svg>
    </div>);
}
export function Home() {
    useEffect(() => {
        const id = window.location.hash.replace("#", "");
        if (!id)
            return;
        requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }, []);
    return (<div className="relative overflow-hidden bg-white">
      <section id="hero" className={`relative min-h-[100dvh] ${SCROLL_MT}`}>
        <video className="absolute inset-0 h-full w-full object-cover object-center [transform:translateZ(0)]" autoPlay muted loop playsInline poster={IMG.hero}>
          <source src={HERO_VIDEO} type="video/mp4"/>
          <source src={HERO_VIDEO_FALLBACK} type="video/mp4"/>
        </video>
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} aria-hidden/>
        <HeroBackdropSvgs />
        <div className="absolute inset-0 bg-[#003d7a]/40 backdrop-blur-[1px]"/>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0059B3]/50 via-[#0c4a6e]/38 to-[#0369a1]/52"/>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/60 via-transparent to-[#0059B3]/18"/>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_12%,rgba(255,255,255,0.12),transparent_52%)]"/>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#020617]/70 to-transparent"/>
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" aria-hidden/>

        <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-4xl flex-col justify-center px-6 pb-24 pt-[5.5rem] md:px-10 md:pb-28">
          <motion.div variants={container} initial="hidden" animate="show" className="w-full">
            <motion.div variants={item} className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2 pr-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/95 backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 text-amber-200"/>
              Rwanda · Digital health continuity
            </motion.div>
            <motion.h1 variants={item} className="mt-7 font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-white [text-shadow:0_2px_32px_rgba(0,0,0,0.25)] sm:text-5xl md:mt-8 md:text-6xl lg:text-[3.35rem]">
              <span className="block text-white/90">One passport,</span>
              <span className="mt-1 block bg-gradient-to-r from-white via-white to-cyan-100/95 bg-clip-text text-transparent">
                every touchpoint aligned
              </span>
            </motion.h1>
            <motion.p variants={item} className="mt-7 max-w-xl text-[1.05rem] leading-relaxed text-white/88 md:text-xl">
              Sign up, pick a role, and work from a single timeline: labs, clinicians, and patients
              see the same facts. Built for shaky networks with offline-friendly queues.
            </motion.p>

            <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link to="/register" className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-white px-8 text-sm font-bold text-[#0059B3] ring-1 ring-white/20 transition hover:bg-white/95">
                Open account
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5"/>
              </Link>
              <a href="#why-us" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md border border-white/45 bg-white/10 px-8 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/18">
                Why choose us
                <ArrowUpRight className="h-4 w-4 opacity-90"/>
              </a>
            </motion.div>
            <motion.div variants={item} className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <a href="#activities" className="inline-flex items-center gap-1.5 font-semibold text-white/85 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white/60">
                Main activities
                <ArrowRight className="h-3.5 w-3.5"/>
              </a>
            </motion.div>
          </motion.div>

          <motion.a href="#why-us" className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 transition hover:text-white/80" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.5 }}>
            <span className="sr-only">Scroll to Why choose us</span>
            <span aria-hidden>Explore</span>
            <ChevronDown className="h-5 w-5 motion-safe:animate-bounce" strokeWidth={2}/>
          </motion.a>
        </div>
        <HeroWave />
      </section>

      <section id="why-us" className={`border-t border-slate-200/80 bg-white py-16 md:py-24 ${SCROLL_MT}`}>
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center md:gap-14 md:px-10">
          <div className="flex justify-center md:justify-start">
            <HeroHealthIllustration className="h-auto w-full max-w-md"/>
          </div>
          <div>
            <p className="mb-3 inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[#0059B3]" aria-hidden/>
              Why choose us
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 text-balance md:text-4xl">
              Continuity for every patient and provider
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
              One longitudinal record, clear access rules, and a demo you can run in the real world, not
              a slide deck.
            </p>
            <div className="mt-6 flex items-start gap-3">
              <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0059B3]/10 text-[#0059B3]">
                <Sparkles className="h-4 w-4" strokeWidth={2}/>
              </span>
              <p className="text-base leading-relaxed text-slate-600">
                Help people carry their health story with less friction, aligned with Rwanda’s digital
                health direction.
              </p>
            </div>
            <ul className="mt-8 space-y-4 text-base leading-relaxed text-slate-700">
              {[
            "Fewer duplicate tests when everyone sees the same history.",
            "Clear rules for who can see what.",
            "Works on shaky networks: actions queue until you’re back.",
        ].map((line) => (<li key={line} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-[#0059B3]/10 text-[#0059B3]">
                    <Check className="h-3 w-3" strokeWidth={3}/>
                  </span>
                  <span className="text-pretty">{line}</span>
                </li>))}
            </ul>
          </div>
        </div>
      </section>

      <section id="activities" className={`border-y border-slate-200/90 bg-slate-50 py-16 md:py-24 ${SCROLL_MT}`}>
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="mb-12 md:mb-14">
            <p className="mb-3 inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[#0059B3]" aria-hidden/>
              Main activities
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 text-balance md:text-4xl">
              What we’re building
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              From sign-in to trusted data: four stages the demo walks through in order.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FLOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (<article key={step.id} className="flex h-full flex-col rounded-lg border border-slate-200/90 bg-white p-5 shadow-none ring-1 ring-slate-900/[0.04] md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-mono text-2xl font-bold tabular-nums leading-none text-[#0059B3]/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0059B3]/10 text-[#0059B3]">
                        <Icon className="h-5 w-5" strokeWidth={2}/>
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </article>);
        })}
            </div>
            <div className="flex h-full min-h-0 w-full flex-col">
              <ActivitiesSlideshow slides={ACTIVITY_SLIDES} className="w-full flex-1 lg:min-h-0"/>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className={`border-t border-slate-200/90 bg-slate-50 py-16 md:py-20 ${SCROLL_MT}`}>
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <div className="rounded-2xl border border-[#004a99]/25 bg-[#0059B3] px-6 py-12 text-center text-white shadow-lg shadow-slate-900/10 md:px-12 md:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Get started</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-balance md:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Ready to run the full demo?
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              Create an account or sign in: your workspace opens in seconds.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link to="/register" className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-white px-8 text-sm font-bold text-[#0059B3] transition hover:bg-white/95 sm:w-auto sm:min-w-[200px]">
                Create account
                <ArrowRight className="h-4 w-4"/>
              </Link>
              <Link to="/login" className="inline-flex min-h-[52px] w-full items-center justify-center rounded-md border-2 border-white/90 bg-transparent px-8 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto sm:min-w-[200px]">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>);
}
