import { get, set, del } from "idb-keyval";

const QUEUE_KEY = "rw_offline_queue_v1";

export type QueuedJob = {
  id: string;
  path: string;
  method: string;
  body: string;
  createdAt: number;
};

export function notifyQueueChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("rw-offline-queue"));
}

export async function readQueue(): Promise<QueuedJob[]> {
  const q = await get<QueuedJob[]>(QUEUE_KEY);
  return Array.isArray(q) ? q : [];
}

export async function enqueueJob(path: string, method: string, body: string): Promise<string> {
  const id = crypto.randomUUID();
  const job: QueuedJob = { id, path, method, body, createdAt: Date.now() };
  const list = await readQueue();
  list.push(job);
  await set(QUEUE_KEY, list);
  notifyQueueChanged();
  return id;
}

export async function saveQueue(list: QueuedJob[]): Promise<void> {
  if (list.length === 0) await del(QUEUE_KEY);
  else await set(QUEUE_KEY, list);
  notifyQueueChanged();
}

export async function flushQueue(): Promise<{ remaining: QueuedJob[] }> {
  const list = await readQueue();
  const remaining: QueuedJob[] = [];
  for (const job of list) {
    try {
      const res = await fetch(job.path, {
        method: job.method,
        credentials: "include",
        headers:
          job.method === "GET" ? undefined : { "Content-Type": "application/json" },
        body: job.method === "GET" ? undefined : job.body,
      });
      if (!res.ok) remaining.push(job);
    } catch {
      remaining.push(job);
    }
  }
  await saveQueue(remaining);
  return { remaining };
}
