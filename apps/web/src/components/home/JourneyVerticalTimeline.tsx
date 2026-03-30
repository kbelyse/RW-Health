import { Fragment, useId } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
type Milestone = {
    year: string;
    title: string;
    description: string;
};
function TimelineArrow() {
    const gid = useId().replace(/:/g, "");
    const gradId = `jvt-arrow-${gid}`;
    return (<div className="hidden shrink-0 items-center justify-center self-center px-1 md:flex md:w-12 lg:w-16" aria-hidden>
      <svg className="h-8 w-full max-w-[4.5rem] text-slate-300" viewBox="0 0 80 32" fill="none">
        <path d="M4 16h48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 6"/>
        <path d="M50 10l12 6-12 6" stroke={`url(#${gradId})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <defs>
          <linearGradient id={gradId} x1="4" y1="16" x2="62" y2="16">
            <stop stopColor="#22d3ee"/>
            <stop offset="1" stopColor="#2563eb"/>
          </linearGradient>
        </defs>
      </svg>
    </div>);
}
function MilestoneCard({ row, index, total, }: {
    row: Milestone;
    index: number;
    total: number;
}) {
    return (<motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: 0.06 * index, duration: 0.45 }} className="group relative flex min-h-full flex-1 flex-col rounded-3xl border border-slate-200/90 bg-white p-7 shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] transition hover:border-slate-300/90 hover:shadow-md md:p-8">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-baseline gap-1.5 font-display text-4xl font-bold tabular-nums tracking-tight text-slate-900 md:text-[2.35rem]">
          {row.year}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div className="mt-5 h-px w-12 bg-gradient-to-r from-cyan-500 to-brand-600"/>
      <h3 className="mt-5 font-display text-lg font-bold leading-snug text-slate-900 md:text-xl">
        {row.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 md:text-[15px]">
        {row.description}
      </p>
    </motion.article>);
}
export function JourneyVerticalTimeline({ items }: {
    items: Milestone[];
}) {
    return (<div className="relative mx-auto mt-14 max-w-6xl">
      
      <div className="hidden md:flex md:flex-row md:items-stretch md:justify-center">
        {items.map((row, i) => (<Fragment key={row.year}>
            <div className="min-w-0 flex-1">
              <MilestoneCard row={row} index={i} total={items.length}/>
            </div>
            {i < items.length - 1 && <TimelineArrow />}
          </Fragment>))}
      </div>

      
      <div className="space-y-3 md:hidden">
        {items.map((row, i) => (<Fragment key={row.year}>
            <MilestoneCard row={row} index={i} total={items.length}/>
            {i < items.length - 1 && (<div className="flex justify-center py-1" aria-hidden>
                <ChevronDown className="h-5 w-5 text-slate-300" strokeWidth={2}/>
              </div>)}
          </Fragment>))}
      </div>
    </div>);
}
