import { useEffect, useMemo, useState } from "react";
import { request } from "../../utils/api";
import type { LanguagePairDTO, SpecializationWithMeta, TranslatorProfileDTO } from "../translator-settings/types";

interface PaginatedResponse<T> {
    count: number;
    results: T[];
}

export interface TranslatorListItem {
    id: number;
    fullName: string;
    experienceYears: number;
    hourlyRate: number | null;
    currency: string;
    rating: number | null;
    completedOrders: number;
    languages: LanguagePairDTO[];
    specializations: SpecializationWithMeta[];
    avatar: string | null;
}

export interface TranslatorSearchFilters {
    languageFrom: number | null;
    languageTo: number | null;
    specializationId: number | null;
    maxRate: number | null;
    minRating: number | null;
    search: string | null;
}

export interface UseTranslatorSearchArgs {
    page: number;
    pageSize: number;
    sort: string | null;
    filters: TranslatorSearchFilters;
}

interface UseTranslatorSearchState {
    items: TranslatorListItem[];
    total: number;
    isLoading: boolean;
    error: string | null;
}

const sortMap: Record<string, string | null> = {
    relevance: null,
    rating_desc: "-avg_rating_cached",
    rate_asc: "hourly_rate",
    rate_desc: "-hourly_rate",
    experience_desc: "-experience_years",
};

function toNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isNaN(numeric) ? null : numeric;
}

function normalizeTranslator(item: TranslatorProfileDTO): TranslatorListItem {
    return {
        id: item.id,
        fullName: item.full_name || "Без имени",
        experienceYears: item.experience_years,
        hourlyRate: toNumber(item.hourly_rate),
        currency: item.currency?.code ?? "USD",
        rating: toNumber(item.avg_rating_cached),
        completedOrders: item.completed_orders_count,
        languages: item.language_pairs ?? [],
        specializations: item.specializations ?? [],
        avatar: item.avatar ?? null,
    };
}

export function useTranslatorSearch({ page, pageSize, sort, filters }: UseTranslatorSearchArgs): UseTranslatorSearchState {
    const [state, setState] = useState<UseTranslatorSearchState>({
        items: [],
        total: 0,
        isLoading: true,
        error: null,
    });

    const ordering = sort
        ? Object.prototype.hasOwnProperty.call(sortMap, sort)
            ? sortMap[sort as keyof typeof sortMap]
            : sort
        : null;
    const offset = Math.max(0, (page - 1) * pageSize);

    const query = useMemo(() => {
        const params = new URLSearchParams();
        params.set("limit", String(pageSize));
        params.set("offset", String(offset));

        if (filters.languageFrom) params.set("language_from", String(filters.languageFrom));
        if (filters.languageTo) params.set("language_to", String(filters.languageTo));
        if (filters.specializationId) params.set("specialization", String(filters.specializationId));
        if (filters.maxRate != null) params.set("max_rate", String(filters.maxRate));
        if (filters.minRating != null) params.set("min_rating", String(filters.minRating));
        if (ordering) params.set("ordering", ordering);
        
        // Поиск по имени/фамилии
        if (filters.search && filters.search.trim()) {
            params.set("search", filters.search.trim());
        }

        return params.toString();
    }, [
        filters.languageFrom,
        filters.languageTo,
        filters.specializationId,
        filters.maxRate,
        filters.minRating,
        filters.search,
        ordering,
        offset,
        pageSize,
    ]);

    useEffect(() => {
        const controller = new AbortController();
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        request<PaginatedResponse<TranslatorProfileDTO>>(`/translators/?${query}`, { signal: controller.signal })
            .then((response) => {
                const items = response.results.map(normalizeTranslator);

                setState({
                    items,
                    total: response.count,
                    isLoading: false,
                    error: null,
                });
            })
            .catch((error) => {
                if (error.name === "AbortError") return;
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error instanceof Error ? error.message : "Не удалось загрузить переводчиков",
                    items: [],
                    total: 0,
                }));
            });

        return () => controller.abort();
    }, [query]);

    return state;
}


