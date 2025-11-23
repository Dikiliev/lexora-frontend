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
import { useSearchParams } from "react-router-dom";

import SearchFilters from "../components/SearchFilters";
import TranslatorCard from "../components/TranslatorCard";
import { useTranslatorSearch, type TranslatorSearchFilters } from "./search/useTranslatorSearch";
import type { Language, SpecializationOption } from "./translator-settings/types";
import { request } from "../utils/api";

const PAGE_SIZE = 12;

type SortKey = "relevance" | "rating_desc" | "rate_asc" | "rate_desc" | "experience_desc";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
    { value: "relevance", label: "По релевантности" },
    { value: "rating_desc", label: "По рейтингу" },
    { value: "rate_asc", label: "Ставка ↑" },
    { value: "rate_desc", label: "Ставка ↓" },
    { value: "experience_desc", label: "По опыту" },
];

const DEFAULT_FILTERS: TranslatorSearchFilters = {
    languageFrom: null,
    languageTo: null,
    specializationId: null,
    maxRate: null,
    minRating: null,
    search: null,
};

function parseNumber(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

export default function Search() {
    const isMdUp = useMediaQuery("(min-width:900px)");
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState<TranslatorSearchFilters>({ ...DEFAULT_FILTERS });
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sort, setSort] = useState<SortKey>("relevance");
    const [page, setPage] = useState(1);
    const [isFiltersDrawerOpen, setFiltersDrawerOpen] = useState(false);

    const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
    const [specializationsLoading, setSpecializationsLoading] = useState(true);
    const [pendingSpecializationKey, setPendingSpecializationKey] = useState<string | null>(null);

    const [languageOptions, setLanguageOptions] = useState<Language[]>([]);

    // Считаем активные фильтры
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.languageFrom) count++;
        if (filters.languageTo) count++;
        if (filters.specializationId) count++;
        if (filters.maxRate != null) count++;
        if (filters.minRating != null) count++;
        if (filters.search && filters.search.trim()) count++;
        return count;
    }, [filters]);

    // Первичный разбор query-параметров
    useEffect(() => {
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const specParam = searchParams.get("spec");
        const maxRate = parseNumber(searchParams.get("maxRate"));
        const minRating = parseNumber(searchParams.get("minRating"));
        const sortParam = searchParams.get("sort") as SortKey | null;
        const pageParam = parseNumber(searchParams.get("page"));
        const searchParam = searchParams.get("search");

        const initialSearch = searchParam || "";
        
        setFilters({
            languageFrom: from && !Number.isNaN(Number(from)) ? Number(from) : null,
            languageTo: to && !Number.isNaN(Number(to)) ? Number(to) : null,
            specializationId: specParam && !Number.isNaN(Number(specParam)) ? Number(specParam) : null,
            maxRate,
            minRating,
            search: searchParam,
        });

        setSearchQuery(initialSearch);

        if (specParam && (Number.isNaN(Number(specParam)) || specParam.trim() === "")) {
            setPendingSpecializationKey(specParam);
        }

        if (sortParam && SORT_OPTIONS.some((option) => option.value === sortParam)) {
            setSort(sortParam);
        }

        if (pageParam && pageParam > 0) {
            setPage(pageParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Загрузка специализаций
    useEffect(() => {
        let isMounted = true;
        setSpecializationsLoading(true);

        request<{ results?: SpecializationOption[] } | SpecializationOption[]>("/specializations/")
            .then((response) => {
                if (!isMounted) return;
                const list = Array.isArray(response) ? response : response.results ?? [];
                setSpecializations(list);
                setSpecializationsLoading(false);

                if (pendingSpecializationKey) {
                    const keyLower = pendingSpecializationKey.toLowerCase();
                    const matched = list.find(
                        (item) =>
                            item.slug?.toLowerCase() === keyLower ||
                            item.title.toLowerCase() === keyLower,
                    );
                    if (matched) {
                        setFilters((prev) => ({ ...prev, specializationId: matched.id }));
                    }
                    setPendingSpecializationKey(null);
                }
            })
            .catch(() => {
                if (!isMounted) return;
                setSpecializations([]);
                setSpecializationsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [pendingSpecializationKey]);

    const { items, total, isLoading, error } = useTranslatorSearch({
        page,
        pageSize: PAGE_SIZE,
        sort,
        filters,
    });

    // Загрузка языков
    useEffect(() => {
        let isMounted = true;
        request<{ results?: Language[] } | Language[]>("/languages/")
            .then((response) => {
                if (!isMounted) return;
                const list = Array.isArray(response) ? response : response.results ?? [];
                setLanguageOptions(list);
            })
            .catch(() => {
                if (!isMounted) return;
                setLanguageOptions([]);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Синк URL со стейтом
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.languageFrom) params.set("from", String(filters.languageFrom));
        if (filters.languageTo) params.set("to", String(filters.languageTo));
        if (filters.specializationId) params.set("spec", String(filters.specializationId));
        if (filters.maxRate != null) params.set("maxRate", String(filters.maxRate));
        if (filters.minRating != null) params.set("minRating", String(filters.minRating));
        if (filters.search && filters.search.trim()) params.set("search", filters.search.trim());
        if (sort !== "relevance") params.set("sort", sort);
        if (page > 1) params.set("page", String(page));

        setSearchParams(params, { replace: true });
    }, [filters, sort, page, setSearchParams]);

    const handleFiltersChange = useCallback(
        (patch: Partial<TranslatorSearchFilters>) => {
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
        // Обновляем фильтры сразу при submit (без ожидания debounce)
        setFilters((prev) => ({ ...prev, search: trimmed || null }));
        setPage(1);
    }, [searchQuery]);

    // Debounce для поиска - обновляем фильтры через 500ms после остановки ввода
    useEffect(() => {
        const trimmed = searchQuery.trim();
        const timer = setTimeout(() => {
            setFilters((prev) => {
                const newSearch = trimmed || null;
                // Обновляем только если значение изменилось
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

    const filtersLoading = specializationsLoading; // фильтры грузятся только от справочников

    // Скелетоны
    const renderSkeletonCards = () =>
        Array.from({ length: 6 }).map((_, index) => (
            <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2}>
                        <Skeleton variant="circular" width={48} height={48} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" />
                            <Skeleton variant="text" width="45%" />
                            <Skeleton
                                variant="rectangular"
                                height={22}
                                sx={{ mt: 1, borderRadius: 1 }}
                            />
                        </Box>
                    </Stack>
                </Paper>
            </Grid>
        ));

    // Пустое состояние
    const renderEmptyState = () => (
        <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="subtitle1">Ничего не найдено</Typography>
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
                            <SearchFilters
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
                    {/* Поиск по имени */}
                    <Paper
                        component="form"
                        onSubmit={handleSearchSubmit}
                        sx={{ p: 2, mb: 1.5 }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Поиск по имени или фамилии переводчика..."
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
                                <Typography variant="h6">Переводчики</Typography>
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
                            items.map((translator) => (
                                <Grid key={translator.id} size={{ xs: 12, sm: 12, md: 12 }}>
                                    <TranslatorCard translator={translator} />
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
                    <SearchFilters
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
