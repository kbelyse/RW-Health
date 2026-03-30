import { Fragment } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
export type FlowStep = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
};
export function FlowTimeline({ steps }: {
    steps: FlowStep[];
}) {
    return (<div className="mt-12 md:mt-16">
      
      <div className="hidden md:block">
        <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(0,89,179,0.06)_0%,transparent_100%)]" aria-hidden/>

          <div className="relative overflow-x-auto pb-1 [scrollbar-width:thin] lg:overflow-visible lg:pb-0">
            <div className="mx-auto min-w-[640px] max-w-5xl lg:min-w-0">
              
              <div className="flex items-center justify-between gap-1">
                {steps.map((step, i) => (<Fragment key={`rail-${step.id}`}>
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: 0.06 * i, duration: 0.45 }} className="flex min-w-0 flex-1 justify-center">
                      <div className="relative w-fit">
                        <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-lg bg-[#0059B3] text-white ring-2 ring-[#0059B3]/25">
                          <step.icon className="h-8 w-8" strokeWidth={1.75}/>
                        </div>
                        <span className="absolute -right-1 -top-1 flex h-7 min-w-[1.75rem] items-center justify-center rounded-md border border-white bg-slate-900 px-1.5 text-[11px] font-bold tabular-nums text-white">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </motion.div>

                    {i < steps.length - 1 && (<div className="flex h-[4.5rem] w-10 shrink-0 items-center justify-center px-0.5 lg:w-14" aria-hidden>
                        <div className="flex w-full items-center">
                          <div className="h-[3px] flex-1 rounded-full bg-slate-200"/>
                          <ChevronRight className="mx-0.5 h-6 w-6 shrink-0 text-[#0059B3] lg:h-7 lg:w-7" strokeWidth={2.25}/>
                          <div className="h-[3px] flex-1 rounded-full bg-slate-200"/>
                        </div>
                      </div>)}
                  </Fragment>))}
              </div>

              
              <div className="mt-10 grid grid-cols-4 gap-4 lg:gap-6">
                {steps.map((step, i) => (<motion.div key={step.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 * i + 0.15, duration: 0.4 }} className="min-w-0 text-center">
                    <h3 className="font-display text-lg font-bold tracking-tight text-slate-900 lg:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </motion.div>))}
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="relative md:hidden">
        <div className="absolute left-[1.35rem] top-4 bottom-4 w-[3px] rounded-full bg-slate-200" aria-hidden/>
        <ul className="space-y-8">
          {steps.map((step, i) => (<motion.li key={step.id} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-20px" }} transition={{ delay: 0.05 * i }} className="relative flex gap-5 pl-12">
              <div className="absolute left-0 top-2 z-10 flex h-11 w-11 -translate-x-[2px] items-center justify-center rounded-lg bg-[#0059B3] text-white ring-2 ring-white">
                <step.icon className="h-5 w-5" strokeWidth={2}/>
              </div>
              <div className="min-w-0 flex-1 rounded-lg border border-slate-200/90 bg-white p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 font-display text-lg font-bold text-slate-900">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            </motion.li>))}
        </ul>
      </div>
    </div>);
}
