import { useEffect, useState, useCallback } from "react";
import { request } from "../utils/api";
import type { TranslatorProfileDTO } from "../pages/translator-settings/types";

export function useTranslatorProfile(translatorId: string | undefined) {
    const [profile, setProfile] = useState<TranslatorProfileDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(() => {
        if (!translatorId) return;

        const controller = new AbortController();
        setIsLoading(true);
        setError(null);

        request<TranslatorProfileDTO>(`/translators/${translatorId}/`, { signal: controller.signal })
            .then((data) => {
                setProfile(data);
                setError(null);
            })
            .catch((err) => {
                if ((err as Error).name === "AbortError") return;
                setError(err instanceof Error ? err.message : "Не удалось загрузить профиль");
                setProfile(null);
            })
            .finally(() => setIsLoading(false));

        return () => controller.abort();
    }, [translatorId]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return {
        profile,
        isLoading,
        error,
        reloadProfile: loadProfile,
    };
}

