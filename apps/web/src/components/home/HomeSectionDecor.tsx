const BK = "#0059B3";
export function HeroBackdropSvgs() {
    return (<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg className="absolute -right-[8%] top-[6%] h-[min(380px,42vw)] w-[min(380px,42vw)] text-white/15" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="0.75" opacity={0.45}/>
        <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="0.5" opacity={0.35}/>
        <circle cx="100" cy="100" r="52" stroke="currentColor" strokeWidth="0.5" opacity={0.25}/>
      </svg>
      <svg className="absolute bottom-[18%] left-[-2%] h-16 w-56 text-cyan-200/35 md:h-20 md:w-72" viewBox="0 0 280 48" fill="none">
        <path d="M4 28h32l8-18 16 36 20-44 14 32 18-26h168" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.9}/>
      </svg>
      <svg className="absolute left-[6%] top-[22%] h-24 w-24 text-white/10 md:h-32 md:w-32" viewBox="0 0 64 64" fill="none">
        <path d="M32 8v48M8 32h48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity={0.6}/>
        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1" opacity={0.35}/>
      </svg>
      <svg className="absolute bottom-[12%] right-[12%] h-32 w-32 text-white/20" viewBox="0 0 80 80" fill="currentColor">
        {Array.from({ length: 5 }).flatMap((_, row) => Array.from({ length: 5 }).map((_, col) => (<circle key={`${row}-${col}`} cx={10 + col * 15} cy={10 + row * 15} r="1.2" opacity={0.35 + (row + col) * 0.06}/>)))}
      </svg>
    </div>);
}
export function DemoCtaBackdropSvgs() {
    return (<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#0059B3]/[0.12] blur-3xl"/>
      <div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl"/>
      <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-cyan-200/40 blur-2xl"/>

      <svg className="absolute left-4 top-6 h-28 w-28 text-[#0059B3]/25 md:left-10 md:top-10 md:h-36 md:w-36" viewBox="0 0 120 120" fill="none">
        <rect x="24" y="12" width="72" height="96" rx="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M40 36h40M40 52h48M40 68h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="88" cy="88" r="22" fill={BK} fillOpacity={0.15} stroke={BK} strokeWidth="1.5"/>
        <path d="M78 88l6 6 14-14" stroke={BK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      <svg className="absolute bottom-8 right-6 h-32 w-28 text-[#0059B3]/20 md:bottom-12 md:right-16 md:h-40 md:w-36" viewBox="0 0 100 120" fill="none">
        <path d="M50 8 L88 22 V52 C88 82 50 108 50 108 C50 108 12 82 12 52 V22 L50 8Z" stroke="currentColor" strokeWidth="2" fill={BK} fillOpacity={0.06}/>
        <path d="M38 58 L46 66 L64 46" stroke={BK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity={0.5}/>
      </svg>

      <svg className="absolute right-8 top-8 hidden h-24 w-40 text-[#0059B3]/30 md:block" viewBox="0 0 160 80" fill="none">
        <circle cx="24" cy="40" r="8" fill={BK} fillOpacity={0.35}/>
        <circle cx="80" cy="24" r="8" fill={BK} fillOpacity={0.25}/>
        <circle cx="136" cy="40" r="8" fill={BK} fillOpacity={0.35}/>
        <path d="M32 40 L72 28 M88 28 L128 40 M72 32 L72 48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.6}/>
      </svg>

      <svg className="absolute bottom-16 left-1/4 hidden h-12 w-48 -translate-x-1/2 text-[#0059B3]/20 lg:block" viewBox="0 0 192 48" fill="none">
        <rect x="4" y="8" width="184" height="32" rx="6" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="12" y="14" width="40" height="20" rx="2" fill={BK} fillOpacity={0.12}/>
        <path d="M60 20h100M60 28h72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>);
}
export function DemoCtaIconRow() {
    return (<div className="mb-8 flex flex-wrap items-center justify-center gap-4 md:gap-6" aria-hidden>
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-[#0059B3]/25 bg-[#0059B3]/10 text-[#0059B3]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-[#0059B3]/25 bg-[#0059B3]/10 text-[#0059B3]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-[#0059B3]/25 bg-[#0059B3]/10 text-[#0059B3]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      </div>
    </div>);
}
