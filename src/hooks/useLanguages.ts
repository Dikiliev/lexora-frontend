import { useEffect, useState } from "react";
import { request } from "../utils/api";
import type { Language } from "../pages/translator-settings/types";

export function useLanguages() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        request<Language[]>("/languages/")
            .then((data) => {
                if (!isMounted) return;
                const list = Array.isArray(data) ? data : (data as { results?: Language[] }).results ?? [];
                setLanguages(list);
                setError(null);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Не удалось загрузить языки");
                setLanguages([]);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return { languages, isLoading, error };
}


