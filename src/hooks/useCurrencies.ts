import { useEffect, useState } from "react";
import { request } from "../utils/api";
import type { Currency } from "../pages/translator-settings/types";

export function useCurrencies() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        request<Currency[]>("/currencies/")
            .then((data) => {
                if (!isMounted) return;
                const list = Array.isArray(data) ? data : (data as { results?: Currency[] }).results ?? [];
                setCurrencies(list);
                setError(null);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Не удалось загрузить валюты");
                setCurrencies([]);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return { currencies, isLoading, error };
}




