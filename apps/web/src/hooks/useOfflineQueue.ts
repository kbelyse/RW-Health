import { useCallback, useEffect, useState } from "react";
import {
  flushQueue,
  readQueue,
  type QueuedJob,
} from "@/lib/offlineQueue";

export type { QueuedJob };

export function useOfflineQueue(online: boolean) {
  const [jobs, setJobs] = useState<QueuedJob[]>([]);

  const load = useCallback(async () => {
    setJobs(await readQueue());
  }, []);

  useEffect(() => {
    void load();
    const onQueue = () => void load();
    window.addEventListener("rw-offline-queue", onQueue);
    return () => window.removeEventListener("rw-offline-queue", onQueue);
  }, [load]);

  const flush = useCallback(async () => {
    const { remaining } = await flushQueue();
    setJobs(remaining);
  }, []);

  useEffect(() => {
    if (online) void flush();
  }, [online, flush]);

  return { jobs, flush, reload: load };
}
