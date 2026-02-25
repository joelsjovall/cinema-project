import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const API = "";

type AuthUser = {
    email?: string;
    [key: string]: unknown;
};

type AuthContextValue = {
    user: AuthUser | null;
    authLoading: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    async function refresh() {
        try {
            const res = await fetch(`${API}/api/login`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok || data?.error) {
                setUser(null);
                return;
            }
            setUser(data);
        } catch {
            setUser(null);
        }
    }

    function toSwedishError(message: string) {
        const normalized = message.trim().toLowerCase();
        if (normalized === "no such user.") return "Ingen användare med den e‑posten.";
        if (normalized === "password mismatch.") return "Fel lösenord.";
        if (normalized === "a user is already logged in.") return "Du är redan inloggad.";
        return "Inloggning misslyckades.";
    }

    async function login(email: string, password: string) {
        const res = await fetch(`${API}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok || data?.error) {
            const message = data?.error ? toSwedishError(data.error) : "Inloggning misslyckades.";
            throw new Error(message);
        }

        setUser(data);
        return data;
    }

    async function logout() {
        try {
            await fetch(`${API}/api/login`, {
                method: "DELETE",
                credentials: "include",
            });
        } finally {
            setUser(null);
        }
    }

    useEffect(() => {
        let cancelled = false;
        setAuthLoading(true);
        refresh()
            .catch(() => null)
            .finally(() => {
                if (!cancelled) setAuthLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        authLoading,
        login,
        logout,
        refresh,
    }), [user, authLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth måste användas inom AuthProvider.");
    }
    return ctx;
}
