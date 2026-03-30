export function UndrawMedicalPassport({ className = "" }: {
    className?: string;
}) {
    return (<svg viewBox="0 0 520 380" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="ump-bg" x1="60" y1="20" x2="460" y2="360" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" stopOpacity="0.15"/>
          <stop offset="0.5" stopColor="#2563eb" stopOpacity="0.12"/>
          <stop offset="1" stopColor="#06b6d4" stopOpacity="0.18"/>
        </linearGradient>
        <linearGradient id="ump-card" x1="180" y1="120" x2="420" y2="300" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8fafc"/>
          <stop offset="1" stopColor="#e0f2fe"/>
        </linearGradient>
        <linearGradient id="ump-blue" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#38bdf8"/>
          <stop offset="1" stopColor="#2563eb"/>
        </linearGradient>
        <linearGradient id="ump-teal" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2dd4bf"/>
          <stop offset="1" stopColor="#0d9488"/>
        </linearGradient>
        <filter id="ump-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="b"/>
          <feMerge>
            <feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="260" cy="340" rx="220" ry="22" fill="#e2e8f0" opacity="0.5"/>

      <circle cx="420" cy="80" r="48" fill="url(#ump-bg)" opacity="0.8"/>
      <circle cx="90" cy="140" r="36" fill="url(#ump-bg)" opacity="0.6"/>

      <rect x="160" y="88" width="240" height="200" rx="20" fill="url(#ump-card)" stroke="#2563eb" strokeWidth="2.5" strokeOpacity="0.35"/>
      <rect x="188" y="118" width="184" height="12" rx="4" fill="#cbd5e1" opacity="0.8"/>
      <rect x="188" y="142" width="140" height="8" rx="3" fill="#e2e8f0"/>
      <rect x="188" y="160" width="120" height="8" rx="3" fill="#e2e8f0"/>
      <rect x="188" y="186" width="100" height="8" rx="3" fill="#bae6fd" opacity="0.7"/>
      <circle cx="360" cy="228" r="28" fill="url(#ump-blue)" opacity="0.9"/>
      <path d="M360 214v28M346 228h28" stroke="white" strokeWidth="3" strokeLinecap="round"/>

      <ellipse cx="130" cy="310" rx="44" ry="10" fill="#cbd5e1" opacity="0.5"/>
      <path d="M130 200c18 0 32 14 32 32v48h-64v-48c0-18 14-32 32-32z" fill="#1e293b"/>
      <circle cx="130" cy="168" r="36" fill="#fecdd3"/>
      <path d="M94 168c0-20 16-36 36-36s36 16 36 36" stroke="#1e293b" strokeWidth="8" strokeLinecap="round"/>
      <rect x="108" y="232" width="44" height="70" rx="10" fill="white" stroke="#2563eb" strokeWidth="2"/>
      <rect x="118" y="248" width="24" height="4" rx="1" fill="#2563eb" opacity="0.4"/>

      <ellipse cx="390" cy="310" rx="40" ry="9" fill="#cbd5e1" opacity="0.5"/>
      <path d="M390 212c16 0 28 12 28 28v44h-56v-44c0-16 12-28 28-28z" fill="#334155"/>
      <circle cx="390" cy="182" r="32" fill="#fcd9bd"/>
      <path d="M362 182c0-16 12-28 28-28s28 12 28 28" stroke="#334155" strokeWidth="7" strokeLinecap="round"/>
      <path d="M368 244h44l8 56h-60l8-56z" fill="#0ea5e9" opacity="0.85"/>

      <path d="M175 220c40-20 80-20 120 0" stroke="url(#ump-blue)" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" opacity="0.7"/>
      <path d="M295 218l8 6-8 6" fill="#2563eb"/>
      <path d="M405 220c-30 20-60 20-90 0" stroke="url(#ump-teal)" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" opacity="0.7"/>

      <g transform="translate(48 52)">
        <rect width="44" height="44" rx="12" fill="white" stroke="#2563eb" strokeWidth="2"/>
        <path d="M22 14v16M14 22h16" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
      <g transform="translate(420 200)">
        <rect width="48" height="48" rx="14" fill="url(#ump-teal)" opacity="0.9"/>
        <path d="M24 16l10 10-10 10M14 26h20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>);
}
