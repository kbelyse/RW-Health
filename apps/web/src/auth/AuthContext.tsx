import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, } from "react";
import { api } from "@/api/client";
export type Role = "PATIENT" | "CLINICIAN" | "LAB" | "ADMIN";
export interface User {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    primaryRole?: Role;
    secondaryRole?: Role | null;
    emailVerified?: boolean;
}
interface AuthState {
    user: User | null;
    loading: boolean;
    refresh: () => Promise<void>;
    login: (email: string, password: string) => Promise<{
        ok: boolean;
        error?: string;
    }>;
    register: (email: string, password: string, fullName: string, role?: Role, secondaryRole?: Role) => Promise<{
        ok: boolean;
        error?: string;
    }>;
    switchRole: (activeRole: Role) => Promise<{
        ok: boolean;
        error?: string;
    }>;
    logout: () => Promise<void>;
}
const Ctx = createContext<AuthState | null>(null);
export function AuthProvider({ children }: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const authEpochRef = useRef(0);
    const refresh = useCallback(async () => {
        const epoch = ++authEpochRef.current;
        let r = await api<{
            user: User | null;
        }>("/api/auth/me");
        if (!r.ok && (r.status === 0 || r.status === 502 || r.status === 503 || r.status === 504)) {
            await new Promise((resolve) => setTimeout(resolve, 600));
            r = await api<{
                user: User | null;
            }>("/api/auth/me");
        }
        if (epoch !== authEpochRef.current)
            return;
        if (!r.ok) {
            setUser(null);
            return;
        }
        if ("queued" in r && r.queued) {
            setUser(null);
            return;
        }
        if (r.data?.user !== undefined)
            setUser(r.data.user);
        else
            setUser(null);
    }, []);
    useEffect(() => {
        void refresh().finally(() => setLoading(false));
    }, [refresh]);
    const login = useCallback(async (email: string, password: string) => {
        const r = await api<{
            user: User;
        }>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: email.trim(), password }),
        });
        if (!r.ok)
            return { ok: false as const, error: r.error };
        if ("queued" in r && r.queued)
            return { ok: false as const, error: "You are offline" };
        if (!("data" in r) || !r.data?.user)
            return { ok: false as const, error: "Unexpected response" };
        authEpochRef.current++;
        setUser(r.data.user);
        return { ok: true as const };
    }, []);
    const register = useCallback(async (email: string, password: string, fullName: string, role?: Role, secondaryRole?: Role) => {
        const r = await api<{
            user: User;
        }>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                email: email.trim(),
                password,
                fullName: fullName.trim(),
                role,
                ...(secondaryRole ? { secondaryRole } : {}),
            }),
        });
        if (!r.ok)
            return { ok: false as const, error: r.error };
        if ("queued" in r && r.queued)
            return { ok: false as const, error: "You are offline" };
        if (!("data" in r) || !r.data?.user)
            return { ok: false as const, error: "Unexpected response" };
        authEpochRef.current++;
        setUser(r.data.user);
        return { ok: true as const };
    }, []);
    const switchRole = useCallback(async (activeRole: Role) => {
        const r = await api<{
            user: User;
        }>("/api/auth/switch-role", {
            method: "POST",
            body: JSON.stringify({ activeRole }),
        });
        if (!r.ok)
            return { ok: false as const, error: r.error };
        if ("queued" in r && r.queued)
            return { ok: false as const, error: "You are offline" };
        if (!("data" in r) || !r.data?.user)
            return { ok: false as const, error: "Unexpected response" };
        authEpochRef.current++;
        setUser(r.data.user);
        return { ok: true as const };
    }, []);
    const logout = useCallback(async () => {
        authEpochRef.current++;
        await api("/api/auth/logout", { method: "POST" });
        setUser(null);
    }, []);
    const value = useMemo(() => ({ user, loading, refresh, login, register, switchRole, logout }), [user, loading, refresh, login, register, switchRole, logout]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAuth(): AuthState {
    const v = useContext(Ctx);
    if (!v)
        throw new Error("AuthProvider required");
    return v;
}
