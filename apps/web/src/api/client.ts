import { enqueueJob } from "@/lib/offlineQueue";
export type ApiResult<T> = {
    ok: true;
    data: T;
    status: number;
    queued?: false;
} | {
    ok: true;
    queued: true;
    status: 202;
} | {
    ok: false;
    error: string;
    status: number;
};
function isMutating(method: string): boolean {
    return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}
/** Avoid clearing client state on expected 401s (wrong password, etc.). */
function shouldBroadcastSessionLost(path: string): boolean {
    if (!path.startsWith("/api"))
        return false;
    if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register"))
        return false;
    return true;
}
function dispatchSessionUnauthorized(): void {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new CustomEvent("rw-health:session-unauthorized"));
}
export async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
    const method = (init?.method ?? "GET").toUpperCase();
    const bodyStr = typeof init?.body === "string" ? init.body : undefined;
    const allowQueue = isMutating(method) &&
        !!bodyStr &&
        !path.startsWith("/api/auth");
    async function queueIfPossible(): Promise<ApiResult<T> | null> {
        if (!allowQueue)
            return null;
        await enqueueJob(path, method, bodyStr!);
        return { ok: true, queued: true, status: 202 };
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
        const q = await queueIfPossible();
        if (q)
            return q;
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
            }
            catch {
                body = null;
            }
        }
        if (!res.ok) {
            const err = typeof body === "object" && body !== null && "error" in body
                ? String((body as {
                    error: string;
                }).error)
                : "Request failed";
            if (status === 401 && shouldBroadcastSessionLost(path))
                dispatchSessionUnauthorized();
            return { ok: false, error: err, status };
        }
        return { ok: true, data: body as T, status };
    }
    catch {
        const q = await queueIfPossible();
        if (q)
            return q;
        return { ok: false, error: "Network unavailable", status: 0 };
    }
}
export async function apiForm<T>(path: string, formData: FormData): Promise<ApiResult<T>> {
    try {
        const res = await fetch(path, {
            method: "POST",
            body: formData,
            credentials: "include",
        });
        const status = res.status;
        let body: unknown = null;
        const ct = res.headers.get("content-type");
        if (ct?.includes("application/json")) {
            try {
                body = await res.json();
            }
            catch {
                body = null;
            }
        }
        if (!res.ok) {
            const err = typeof body === "object" && body !== null && "error" in body
                ? String((body as {
                    error: string;
                }).error)
                : "Request failed";
            if (status === 401 && shouldBroadcastSessionLost(path))
                dispatchSessionUnauthorized();
            return { ok: false, error: err, status };
        }
        return { ok: true, data: body as T, status };
    }
    catch {
        return { ok: false, error: "Network unavailable", status: 0 };
    }
}
