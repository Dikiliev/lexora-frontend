import { create } from "zustand";
import { persist } from "zustand/middleware";
import { request } from "../utils/api";

type Role = "client" | "translator" | "admin" | "unknown";

export interface AuthUser {
    id?: number;
    email: string;
    role: Role;
    first_name?: string;
    last_name?: string;
    profile?: unknown;
}

interface RegisterPayload {
    email: string;
    password: string;
    role: Role;
    firstName: string;
    lastName: string;
}

interface AuthState {
    accessToken?: string;
    refreshToken?: string;
    user?: AuthUser;
    isLoading: boolean;
    error?: string;
    isReady: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: undefined,
            refreshToken: undefined,
            user: undefined,
            isLoading: false,
            error: undefined,
            isReady: false,
            logout: () => {
                set({ accessToken: undefined, refreshToken: undefined, user: undefined });
            },
            register: async ({ email, password, role, firstName, lastName }) => {
                set({ isLoading: true, error: undefined });
                try {
                    const jsonPayload: Record<string, unknown> = {
                        email,
                        password,
                        role,
                        first_name: firstName,
                        last_name: lastName,
                    };
                    const response = await request<{
                        error: boolean;
                        message?: string;
                        details?: Record<string, unknown>;
                    }>("/auth/register", {
                        method: "POST",
                        json: jsonPayload,
                    });
                    
                    // Если ответ содержит сообщение об успехе
                    if (response && !response.error && response.message) {
                        // Успешная регистрация
                        set({ isLoading: false, error: undefined });
                    } else {
                        set({ isLoading: false, error: undefined });
                    }
                } catch (error) {
                    let message = "Не удалось зарегистрироваться";
                    
                    if (error instanceof Error) {
                        message = error.message;
                        
                        // Извлекаем детали из data, если есть
                        const errorWithData = error as Error & { data?: { message?: string; details?: Record<string, unknown> } };
                        if (errorWithData.data) {
                            if (errorWithData.data.message) {
                                message = errorWithData.data.message;
                                
                                // Добавляем детали ошибок полей
                                if (errorWithData.data.details) {
                                    const details = errorWithData.data.details;
                                    const detailMessages: string[] = [];
                                    for (const [field, value] of Object.entries(details)) {
                                        if (Array.isArray(value)) {
                                            detailMessages.push(`${field}: ${value.join(", ")}`);
                                        } else if (typeof value === "string") {
                                            detailMessages.push(`${field}: ${value}`);
                                        }
                                    }
                                    if (detailMessages.length > 0) {
                                        message = `${message}\n${detailMessages.join("\n")}`;
                                    }
                                }
                            }
                        }
                    }
                    
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },
            login: async (email: string, password: string) => {
                set({ isLoading: true, error: undefined });
                try {
                    const data = await request<{
                        access: string;
                        refresh: string;
                        user: { id?: number; email: string; role: Role; first_name?: string; last_name?: string };
                    }>("/auth/login", {
                        method: "POST",
                        json: { email, password },
                    });
                    set({
                        accessToken: data.access,
                        refreshToken: data.refresh,
                        user: {
                            id: data.user?.id,
                            email: data.user?.email ?? email,
                            role: data.user?.role ?? "unknown",
                            first_name: data.user?.first_name,
                            last_name: data.user?.last_name,
                        },
                        error: undefined,
                    });
                    await get().fetchUser();
                    set({ isLoading: false, error: undefined });
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Ошибка авторизации";
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },
            fetchUser: async () => {
                const { accessToken, user } = get();
                if (!accessToken) {
                    set({ user: undefined });
                    return;
                }

                const base = {
                    id: user?.id,
                    email: user?.email ?? "",
                    first_name: user?.first_name,
                    last_name: user?.last_name,
                };

                const tryLoad = async (role: Role, url: string) => {
                    try {
                        const profile = await request(url);
                        set({ user: { ...base, role, profile } });
                        return true;
                    } catch (error) {
                        return false;
                    }
                };

                const roleHint = user?.role ?? "unknown";
                if (roleHint === "translator" && (await tryLoad("translator", "/translators/me/"))) {
                    return;
                }
                if (roleHint === "client" && (await tryLoad("client", "/clients/me/"))) {
                    return;
                }
                if (roleHint === "admin") {
                    if (await tryLoad("client", "/clients/me/")) return;
                    if (await tryLoad("translator", "/translators/me/")) return;
                }
                if (await tryLoad("translator", "/translators/me/")) return;
                if (await tryLoad("client", "/clients/me/")) return;

                set({
                    user: {
                        ...base,
                        role: user?.role ?? "unknown",
                        profile: user?.profile,
                    },
                });
            },
            initialize: async () => {
                const { accessToken } = get();
                if (accessToken) {
                    try {
                        await get().fetchUser();
                    } catch (error) {
                        console.error("Auth bootstrap failed", error);
                        set({ accessToken: undefined, refreshToken: undefined, user: undefined });
                    }
                }
                set({ isReady: true });
            },
        }),
        {
            name: "lexora-auth",
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
            }),
        },
    ),
);

