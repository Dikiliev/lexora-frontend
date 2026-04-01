import { useEffect, useMemo, useState, useCallback } from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    Drawer,
    Grid,
    IconButton,
    MenuItem,
    Pagination,
    Paper,
    Skeleton,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

import OrderFilters from "../components/OrderFilters";
import OrderCard from "../components/OrderCard";
import { useOrderSearch, type OrderSearchFilters } from "./orders/useOrderSearch";
import type { Language, SpecializationOption } from "./translator-settings/types";
import { request } from "../utils/api";

const PAGE_SIZE = 12;

type SortKey = "relevance" | "deadline_asc" | "deadline_desc" | "price_asc" | "price_desc" | "created_desc";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
    { value: "relevance", label: "По релевантности" },
    { value: "deadline_asc", label: "Дедлайн ↑" },
    { value: "deadline_desc", label: "Дедлайн ↓" },
    { value: "price_asc", label: "Цена ↑" },
    { value: "price_desc", label: "Цена ↓" },
    { value: "created_desc", label: "Новые сначала" },
];

const DEFAULT_FILTERS: OrderSearchFilters = {
    languageFrom: null,
    languageTo: null,
    specializationId: null,
    minPrice: null,
    maxPrice: null,
    status: null,
    search: null,
};

function parseNumber(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

export default function OrdersSearch() {
    const isMdUp = useMediaQuery("(min-width:900px)");
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const isClient = user?.role === "client";

    const [filters, setFilters] = useState<OrderSearchFilters>({ ...DEFAULT_FILTERS });
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sort, setSort] = useState<SortKey>("relevance");
    const [page, setPage] = useState(1);
    const [isFiltersDrawerOpen, setFiltersDrawerOpen] = useState(false);

    const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
    const [specializationsLoading, setSpecializationsLoading] = useState(true);

    const [languageOptions, setLanguageOptions] = useState<Language[]>([]);

    const { items, total, isLoading, error } = useOrderSearch({
        page,
        pageSize: PAGE_SIZE,
        sort,
        filters,
    });

    // Считаем активные фильтры
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.languageFrom) count++;
        if (filters.languageTo) count++;
        if (filters.specializationId) count++;
        if (filters.minPrice != null) count++;
        if (filters.maxPrice != null) count++;
        if (filters.status) count++;
        if (filters.search && filters.search.trim()) count++;
        return count;
    }, [filters]);

    // Первичный разбор query-параметров
    useEffect(() => {
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const specParam = searchParams.get("spec");
        const minPrice = parseNumber(searchParams.get("minPrice"));
        const maxPrice = parseNumber(searchParams.get("maxPrice"));
        const statusParam = searchParams.get("status");
        const sortParam = searchParams.get("sort") as SortKey | null;
        const pageParam = parseNumber(searchParams.get("page"));
        const searchParam = searchParams.get("search");

        const initialSearch = searchParam || "";
        
        setFilters({
            languageFrom: from && !Number.isNaN(Number(from)) ? Number(from) : null,
            languageTo: to && !Number.isNaN(Number(to)) ? Number(to) : null,
            specializationId: specParam && !Number.isNaN(Number(specParam)) ? Number(specParam) : null,
            minPrice,
            maxPrice,
            status: statusParam || null,
            search: searchParam,
        });

        setSearchQuery(initialSearch);

        if (sortParam && SORT_OPTIONS.some((option) => option.value === sortParam)) {
            setSort(sortParam);
        }

        if (pageParam && pageParam > 0) {
            setPage(pageParam);
        }
    }, []);

    // Загрузка специализаций
    useEffect(() => {
        let isMounted = true;
        setSpecializationsLoading(true);

        request<SpecializationOption[]>("/specializations/")
            .then((data) => {
                if (isMounted) {
                    // Обрабатываем случай, когда API возвращает объект с results
                    const list = Array.isArray(data) ? data : (data as { results?: SpecializationOption[] }).results ?? [];
                    setSpecializations(list);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setSpecializations([]);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setSpecializationsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Загрузка языков
    useEffect(() => {
        let isMounted = true;

        request<Language[]>("/languages/")
            .then((data) => {
                if (isMounted) {
                    // Обрабатываем случай, когда API возвращает объект с results
                    const list = Array.isArray(data) ? data : (data as { results?: Language[] }).results ?? [];
                    setLanguageOptions(list);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setLanguageOptions([]);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Синхронизация URL с фильтрами
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.languageFrom) params.set("from", String(filters.languageFrom));
        if (filters.languageTo) params.set("to", String(filters.languageTo));
        if (filters.specializationId) params.set("spec", String(filters.specializationId));
        if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
        if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
        if (filters.status) params.set("status", filters.status);
        if (filters.search) params.set("search", filters.search);
        if (sort !== "relevance") params.set("sort", sort);
        if (page > 1) params.set("page", String(page));

        setSearchParams(params, { replace: true });
    }, [filters, sort, page, setSearchParams]);

    const handleFiltersChange = useCallback(
        (patch: Partial<OrderSearchFilters>) => {
            setFilters((prev) => ({ ...prev, ...patch }));
            setPage(1);
        },
        [],
    );

    const handleResetFilters = useCallback(() => {
        setFilters({ ...DEFAULT_FILTERS });
        setSearchQuery("");
        setPage(1);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    const handleSearchSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = searchQuery.trim();
        setFilters((prev) => ({ ...prev, search: trimmed || null }));
        setPage(1);
    }, [searchQuery]);

    // Debounce для поиска
    useEffect(() => {
        const trimmed = searchQuery.trim();
        const timer = setTimeout(() => {
            setFilters((prev) => {
                const newSearch = trimmed || null;
                if (prev.search !== newSearch) {
                    return { ...prev, search: newSearch };
                }
                return prev;
            });
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSortChange = useCallback((value: string) => {
        setSort(value as SortKey);
        setPage(1);
    }, []);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const pageClamped = Math.min(page, totalPages);

    useEffect(() => {
        if (page !== pageClamped) {
            setPage(pageClamped);
        }
    }, [page, pageClamped]);

    const filtersLoading = specializationsLoading;

    // Скелетоны
    const renderSkeletonCards = () =>
        Array.from({ length: 6 }).map((_, index) => (
            <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 2 }}>
                    <Stack spacing={1}>
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="45%" />
                        <Skeleton variant="rectangular" height={22} sx={{ borderRadius: 1 }} />
                    </Stack>
                </Paper>
            </Grid>
        ));

    // Пустое состояние
    const renderEmptyState = () => (
        <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="subtitle1">Заказы не найдены</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Измените параметры поиска или сбросьте фильтры.
                </Typography>
                <Button
                    onClick={handleResetFilters}
                    sx={{ mt: 2 }}
                    variant="outlined"
                    size="small"
                >
                    Сбросить всё
                </Button>
            </Paper>
        </Grid>
    );

    return (
        <Container sx={{ py: { xs: 3, md: 4 } }}>
            <Grid container spacing={2.5}>
                {/* Сайдбар с фильтрами */}
                <Grid size={{ xs: 12, md: 3 }}>
                    {isMdUp ? (
                        <Paper
                            sx={{
                                p: 2,
                                position: "sticky",
                                top: 80,
                            }}
                        >
                            <OrderFilters
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                onReset={handleResetFilters}
                                specializationOptions={specializations}
                                languageOptions={languageOptions}
                                isLoading={filtersLoading}
                            />
                        </Paper>
                    ) : (
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mb: 1.5 }}
                            alignItems="center"
                        >
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<TuneRoundedIcon />}
                                onClick={() => setFiltersDrawerOpen(true)}
                            >
                                Фильтры
                            </Button>
                            {activeFiltersCount > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Активно фильтров: {activeFiltersCount}
                                </Typography>
                            )}
                        </Stack>
                    )}
                </Grid>

                {/* Основная колонка */}
                <Grid size={{ xs: 12, md: 9 }}>
                    {/* Поиск */}
                    <Paper
                        component="form"
                        onSubmit={handleSearchSubmit}
                        sx={{ p: 2, mb: 1.5 }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Поиск по названию заказа..."
                            value={searchQuery}
                            onChange={(event) => handleSearchChange(event.target.value)}
                            InputProps={{
                                startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} />,
                            }}
                        />
                    </Paper>

                    {/* Хедер списка */}
                    <Paper sx={{ p: 2, mb: 1.5 }}>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={1}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                        >
                            <Stack spacing={0.25}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography variant="h6">Заказы</Typography>
                                    {isClient && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<PostAddRoundedIcon />}
                                            onClick={() => navigate("/post-job")}
                                        >
                                            Разместить заказ
                                        </Button>
                                    )}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Найдено: {total}
                                    {activeFiltersCount > 0 ? ` · Фильтры: ${activeFiltersCount}` : ""}
                                </Typography>
                            </Stack>

                            <TextField
                                select
                                size="small"
                                label="Сортировка"
                                value={sort}
                                onChange={(event) => handleSortChange(event.target.value)}
                                sx={{ minWidth: { xs: 180, md: 220 } }}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </Paper>

                    {/* Выдача */}
                    <Grid container spacing={2}>
                        {isLoading && items.length === 0 && renderSkeletonCards()}

                        {!isLoading &&
                            items.map((order) => (
                                <Grid key={order.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <OrderCard order={order} />
                                </Grid>
                            ))}

                        {!isLoading && !items.length && !error && renderEmptyState()}
                    </Grid>

                    {/* Ошибка */}
                    {error && (
                        <Box sx={{ mt: 2 }}>
                            <Alert severity="error">{error}</Alert>
                        </Box>
                    )}

                    {/* Пагинация */}
                    {total > PAGE_SIZE && (
                        <Stack alignItems="center" sx={{ mt: 2.5 }}>
                            <Pagination
                                count={totalPages}
                                page={pageClamped}
                                onChange={(_, value) => setPage(value)}
                                color="primary"
                            />
                        </Stack>
                    )}
                </Grid>
            </Grid>

            {/* Мобильный drawer с фильтрами */}
            <Drawer
                anchor="right"
                open={isFiltersDrawerOpen}
                onClose={() => setFiltersDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: 320,
                        maxWidth: "100%",
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Box>
                            <Typography variant="subtitle1">Фильтры</Typography>
                            {activeFiltersCount > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Активно: {activeFiltersCount}
                                </Typography>
                            )}
                        </Box>
                        <IconButton
                            size="small"
                            onClick={() => setFiltersDrawerOpen(false)}
                        >
                            <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Box>

                <Box sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
                    <OrderFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onReset={handleResetFilters}
                        specializationOptions={specializations}
                        languageOptions={languageOptions}
                        isLoading={filtersLoading}
                    />
                </Box>

                <Box
                    sx={{
                        p: 1.5,
                        borderTop: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Button
                        fullWidth
                        variant="contained"
                        size="medium"
                        onClick={() => setFiltersDrawerOpen(false)}
                    >
                        Применить
                    </Button>
                </Box>
            </Drawer>
        </Container>
    );
}

