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
        let errorData: unknown = null;
        try {
            errorData = await response.json();
            
            // Обработка нового формата ошибок с error, message, details
            if (errorData && typeof errorData === "object") {
                // Новый формат: { error: true, message: "...", details: {...} }
                if ("message" in errorData && typeof errorData.message === "string") {
                    message = errorData.message;
                    
                    // Если есть details, формируем детальное сообщение
                    if ("details" in errorData && errorData.details && typeof errorData.details === "object") {
                        const details = errorData.details as Record<string, unknown>;
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
                // Старый формат DRF: { detail: "..." }
                else if ("detail" in errorData) {
                    if (typeof errorData.detail === "string") {
                        message = errorData.detail;
                    } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
                        message = String(errorData.detail[0]);
                    } else if (typeof errorData.detail === "object") {
                        // Если detail - объект с ошибками полей
                        const detailObj = errorData.detail as Record<string, unknown>;
                        const fieldErrors: string[] = [];
                        for (const [field, errors] of Object.entries(detailObj)) {
                            if (Array.isArray(errors)) {
                                fieldErrors.push(`${field}: ${errors.join(", ")}`);
                            } else {
                                fieldErrors.push(`${field}: ${String(errors)}`);
                            }
                        }
                        message = fieldErrors.join("\n");
                    }
                }
                // Если это объект с ошибками полей напрямую
                else {
                    const fieldErrors: string[] = [];
                    for (const [field, value] of Object.entries(errorData)) {
                        if (Array.isArray(value)) {
                            fieldErrors.push(`${field}: ${value.join(", ")}`);
                        } else if (typeof value === "string") {
                            fieldErrors.push(`${field}: ${value}`);
                        }
                    }
                    if (fieldErrors.length > 0) {
                        message = fieldErrors.join("\n");
                    }
                }
            } else if (typeof errorData === "string") {
                message = errorData;
            }
        } catch {
            // ignore parsing errors
        }
        
        const error = new Error(message);
        // Сохраняем полные данные ошибки для дальнейшего использования
        if (errorData) {
            (error as Error & { data?: unknown }).data = errorData;
        }
        throw error;
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

