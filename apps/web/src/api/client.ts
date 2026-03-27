import { enqueueJob } from "@/lib/offlineQueue";

export type ApiResult<T> =
  | { ok: true; data: T; status: number; queued?: false }
  | { ok: true; queued: true; status: 202 }
  | { ok: false; error: string; status: number };

function isMutating(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

export async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const method = (init?.method ?? "GET").toUpperCase();
  const bodyStr = typeof init?.body === "string" ? init.body : undefined;

  const allowQueue =
    isMutating(method) &&
    !!bodyStr &&
    !path.startsWith("/api/auth");

  async function queueIfPossible(): Promise<ApiResult<T> | null> {
    if (!allowQueue) return null;
    await enqueueJob(path, method, bodyStr!);
    return { ok: true, queued: true, status: 202 };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const q = await queueIfPossible();
    if (q) return q;
    return { ok: false, error: "You are offline", status: 0 };
  }

  try {
    const res = await fetch(path, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    const status = res.status;
    let body: unknown = null;
    const ct = res.headers.get("content-type");
    if (ct?.includes("application/json")) {
      try {
        body = await res.json();
      } catch {
        body = null;
      }
    }
    if (!res.ok) {
      const err =
        typeof body === "object" && body !== null && "error" in body
          ? String((body as { error: string }).error)
          : "Request failed";
      return { ok: false, error: err, status };
    }
    return { ok: true, data: body as T, status };
  } catch {
    const q = await queueIfPossible();
    if (q) return q;
    return { ok: false, error: "Network unavailable", status: 0 };
  }
}
