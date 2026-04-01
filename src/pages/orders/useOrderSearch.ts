import { useEffect, useMemo, useState } from "react";
import { request } from "../../utils/api";

interface PaginatedResponse<T> {
    count: number;
    results: T[];
}

export interface OrderDTO {
    id: number;
    topic: string;
    language_from: { id: number; code: string; name: string; native_name?: string };
    language_to: { id: number; code: string; name: string; native_name?: string };
    specializations: Array<{ id: number; slug: string; title: string }>;
    deadline_dt: string;
    status: string;
    price: string | null;
    currency: { id: number; code: string; name: string; symbol?: string } | null;
    created_at: string;
    client: number;
    translator: number | null;
}

export interface OrderListItem {
    id: number;
    topic: string;
    languageFrom: { id: number; name: string; code: string };
    languageTo: { id: number; name: string; code: string };
    specializations: Array<{ id: number; title: string }>;
    deadline: string;
    status: string;
    price: number | null;
    currency: string | null;
    createdAt: string;
}

export interface OrderSearchFilters {
    languageFrom: number | null;
    languageTo: number | null;
    specializationId: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    status: string | null;
    search: string | null;
}

export interface UseOrderSearchArgs {
    page: number;
    pageSize: number;
    sort: string | null;
    filters: OrderSearchFilters;
}

interface UseOrderSearchState {
    items: OrderListItem[];
    total: number;
    isLoading: boolean;
    error: string | null;
}

const sortMap: Record<string, string | null> = {
    relevance: null,
    deadline_asc: "deadline_dt",
    deadline_desc: "-deadline_dt",
    price_asc: "price",
    price_desc: "-price",
    created_desc: "-created_at",
};

function toNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isNaN(numeric) ? null : numeric;
}

function normalizeOrder(item: OrderDTO): OrderListItem {
    return {
        id: item.id,
        topic: item.topic,
        languageFrom: {
            id: item.language_from.id,
            name: item.language_from.name,
            code: item.language_from.code,
        },
        languageTo: {
            id: item.language_to.id,
            name: item.language_to.name,
            code: item.language_to.code,
        },
        specializations: item.specializations.map((s) => ({ id: s.id, title: s.title })),
        deadline: item.deadline_dt,
        status: item.status,
        price: toNumber(item.price),
        currency: item.currency?.code ?? null,
        createdAt: item.created_at,
    };
}

export function useOrderSearch({ page, pageSize, sort, filters }: UseOrderSearchArgs): UseOrderSearchState {
    const [state, setState] = useState<UseOrderSearchState>({
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
        if (filters.minPrice != null) params.set("min_price", String(filters.minPrice));
        if (filters.maxPrice != null) params.set("max_price", String(filters.maxPrice));
        if (filters.status) params.set("status", filters.status);
        if (ordering) params.set("ordering", ordering);
        
        if (filters.search && filters.search.trim()) {
            params.set("search", filters.search.trim());
        }

        return params.toString();
    }, [
        filters.languageFrom,
        filters.languageTo,
        filters.specializationId,
        filters.minPrice,
        filters.maxPrice,
        filters.status,
        filters.search,
        ordering,
        offset,
        pageSize,
    ]);

    useEffect(() => {
        const controller = new AbortController();
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        request<PaginatedResponse<OrderDTO>>(`/orders/?${query}`, { signal: controller.signal })
            .then((response) => {
                const items = response.results.map(normalizeOrder);

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
                    error: error instanceof Error ? error.message : "Не удалось загрузить заказы",
                    items: [],
                    total: 0,
                }));
            });

        return () => controller.abort();
    }, [query]);

    return state;
}



