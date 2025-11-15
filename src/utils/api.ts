import { useAuthStore } from "../stores/authStore";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

type RequestOptions = RequestInit & { json?: unknown };

async function refreshAccessToken(): Promise<boolean> {
    const { refreshToken, logout } = useAuthStore.getState();
    if (!refreshToken) return false;

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
        logout();
        return false;
    }
    const data = (await response.json()) as { access: string };
    useAuthStore.setState({ accessToken: data.access });
    return true;
}

export async function request<T = unknown>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
    const { json, headers: inputHeaders, body: inputBody, ...rest } = options;
    const headers = new Headers(inputHeaders ?? {});
    let body: BodyInit | undefined = inputBody as BodyInit | undefined;

    if (json !== undefined) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(json);
    } else if (body && !(body instanceof FormData) && typeof body !== "string" && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(body);
    }

    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers,
        body,
    });

    if (response.status === 401 && retry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return request<T>(path, options, false);
        }
    }

    if (!response.ok) {
        let message = `${response.status} ${response.statusText}`;
        try {
            const error = await response.json();
            if (typeof error === "string") {
                message = error;
            } else if (error?.detail) {
                message = error.detail;
            } else {
                message = Object.values(error)[0] as string;
            }
        } catch {
            // ignore parsing errors
        }
        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
}

