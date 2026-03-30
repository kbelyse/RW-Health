export function PeopleTimelineArt({ className = "" }: {
    className?: string;
}) {
    return (<svg viewBox="0 0 520 240" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="pa1" x1="0" y1="0" x2="520" y2="240">
          <stop stopColor="#bfdbfe"/>
          <stop offset="1" stopColor="#1e40af"/>
        </linearGradient>
      </defs>
      <path d="M40 180 Q140 120 260 160 T480 140" stroke="url(#pa1)" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {[80, 200, 340, 460].map((x, i) => (<g key={x} transform={`translate(${x - 40} ${120 + i * 8})`}>
          <circle cx="40" cy="40" r="36" fill="#fff" stroke="#1d4ed8" strokeWidth="2"/>
          <circle cx="40" cy="32" r="12" fill="#93c5fd"/>
          <path d="M16 88c8-16 20-24 40-24s32 8 40 24" stroke="#1d4ed8" strokeWidth="2" fill="none"/>
        </g>))}
    </svg>);
}
