import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const INTERVAL_MS = 5500;

export type ActivitySlide = {
  src: string;
  alt: string;
};

type Props = {
  slides: ActivitySlide[];
  className?: string;
};

export function ActivitiesSlideshow({ slides, className = "" }: Props) {
  const [index, setIndex] = useState(0);
  const len = slides.length;

  const go = useCallback(
    (next: number) => {
      setIndex(((next % len) + len) % len);
    },
    [len],
  );

  useEffect(() => {
    if (len <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [len]);

  if (!len) return null;

  const current = slides[index];

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200/90 bg-slate-200/40 shadow-sm ring-1 ring-slate-900/[0.04] lg:aspect-auto lg:h-full lg:min-h-0 ${className}`}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.img
          key={current.src}
          src={current.src}
          alt={current.alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0 h-full w-full object-cover"
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      </AnimatePresence>

      {len > 1 ? (
        <div
          className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5"
          role="tablist"
          aria-label="Slide indicators"
        >
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show slide ${i + 1}`}
              className={`h-2 rounded-full transition-[width,background-color] ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
