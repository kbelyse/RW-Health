export function HeroHealthIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="hg1" x1="60" y1="40" x2="420" y2="320" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bfdbfe" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="hg2" x1="200" y1="80" x2="380" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <ellipse cx="240" cy="300" rx="200" ry="28" fill="#e2e8f0" opacity="0.6" />
      <rect x="120" y="120" width="240" height="160" rx="20" fill="url(#hg2)" stroke="#1d4ed8" strokeWidth="2" />
      <rect x="150" y="150" width="180" height="100" rx="6" fill="white" opacity="0.9" />
      <path d="M170 200h80M170 220h120M170 180h40" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <circle cx="330" cy="170" r="28" fill="url(#hg1)" />
      <path d="M318 170h24M330 158v24" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <circle cx="200" cy="90" r="48" fill="#fff" stroke="#1d4ed8" strokeWidth="3" />
      <path
        d="M200 70c12 0 22 10 22 22 0 8-4 15-10 19 6 4 10 11 10 19v6h-44v-6c0-8 4-15 10-19-6-4-10-11-10-19 0-12 10-22 22-22z"
        fill="#dbeafe"
      />
      <rect x="60" y="200" width="56" height="56" rx="12" fill="#1d4ed8" opacity="0.15" />
      <rect x="364" y="220" width="56" height="56" rx="12" fill="#1d4ed8" opacity="0.15" />
      <rect x="90" y="60" width="72" height="40" rx="10" fill="#fff" stroke="#1d4ed8" strokeWidth="2" />
      <rect x="318" y="60" width="72" height="40" rx="10" fill="#fff" stroke="#1d4ed8" strokeWidth="2" />
    </svg>
  );
}
