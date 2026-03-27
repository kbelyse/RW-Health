import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";

export function OfflineBar({ online }: { online: boolean }) {
  const { jobs, flush } = useOfflineQueue(online);
  const show = !online || jobs.length > 0;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b border-amber-200 bg-amber-50 text-amber-950"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2 text-sm">
            <WifiOff className="h-4 w-4 shrink-0" />
            {!online && (
              <span>
                You are offline. Cached pages work; actions queue until connection returns.
              </span>
            )}
            {online && jobs.length > 0 && (
              <>
                <span>{jobs.length} action(s) pending sync.</span>
                <button
                  type="button"
                  onClick={() => void flush()}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry now
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
