import { useCallback, useEffect, useState } from "react";
import { request } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import type { ClientProfileDTO } from "./types";

interface UseClientSettingsFormOptions {
    onAfterSubmit?: () => Promise<void> | void;
}

export function useClientSettingsForm(options: UseClientSettingsFormOptions = {}) {
    const [profile, setProfile] = useState<ClientProfileDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchUser = useAuthStore((state) => state.fetchUser);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const profileResponse = await request<ClientProfileDTO>("/clients/me/");
            setProfile(profileResponse);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Не удалось загрузить профиль";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const updateProfileField = useCallback(<K extends keyof ClientProfileDTO>(field: K, value: ClientProfileDTO[K]) => {
        setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
    }, []);

    const submit = useCallback(async () => {
        if (!profile) return;

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            
            // Добавляем поля профиля
            formData.append("first_name", profile.first_name || "");
            formData.append("last_name", profile.last_name || "");
            formData.append("company_name", profile.company_name || "");
            formData.append("contacts", JSON.stringify(profile.contacts || {}));
            formData.append("email_enabled", String(profile.email_enabled));
            formData.append("push_enabled", String(profile.push_enabled));

            // Добавляем поля пользователя
            if (profile.phone !== null && profile.phone !== undefined) {
                formData.append("phone", profile.phone);
            }
            if (profile.avatar !== null && profile.avatar !== undefined && typeof profile.avatar !== "string") {
                formData.append("avatar", profile.avatar);
            }

            const updatedProfile = await request<ClientProfileDTO>("/clients/me/", {
                method: "PATCH",
                body: formData,
            });

            setProfile(updatedProfile);
            setSuccess("Профиль успешно обновлен");

            // Обновляем данные пользователя в store
            await fetchUser();

            if (options.onAfterSubmit) {
                await options.onAfterSubmit();
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Не удалось сохранить профиль";
            setError(message);
        } finally {
            setIsSaving(false);
        }
    }, [profile, fetchUser, options]);

    return {
        state: {
            profile,
            isLoading,
            isSaving,
            error,
            success,
        },
        handlers: {
            submit,
            updateProfileField,
            reload: load,
        },
    };
}

