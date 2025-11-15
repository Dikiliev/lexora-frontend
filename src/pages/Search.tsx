import { useEffect, useState } from "react";
import {
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
import { useSearchParams } from "react-router-dom";
import SearchFilters from "../components/SearchFilters";
import TranslatorCard from "../components/TranslatorCard";
import { useTranslatorSearch, type TranslatorSearchFilters } from "./search/useTranslatorSearch";
import type { SpecializationOption } from "./translator-settings/types";
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
};

function parseNumber(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

export default function Search() {
    const isMdUp = useMediaQuery("(min-width:900px)");
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState<TranslatorSearchFilters>(() => ({ ...DEFAULT_FILTERS }));
    const [sort, setSort] = useState<SortKey>("relevance");
    const [page, setPage] = useState(1);
    const [isFiltersDrawerOpen, setFiltersDrawerOpen] = useState(false);
    const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
    const [specializationsLoading, setSpecializationsLoading] = useState(true);
    const [pendingSpecializationKey, setPendingSpecializationKey] = useState<string | null>(null);
    const [languageOptions, setLanguageOptions] = useState<string[]>([]);

    // --- initial params parsing ---
    useEffect(() => {
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const specParam = searchParams.get("spec");
        const maxRate = parseNumber(searchParams.get("maxRate"));
        const minRating = parseNumber(searchParams.get("minRating"));
        const sortParam = searchParams.get("sort") as SortKey | null;
        const pageParam = parseNumber(searchParams.get("page"));

        setFilters({
            languageFrom: from || null,
            languageTo: to || null,
            specializationId: specParam && !Number.isNaN(Number(specParam)) ? Number(specParam) : null,
            maxRate,
            minRating,
        });

        if (specParam && (Number.isNaN(Number(specParam)) || specParam.trim() === "")) {
            setPendingSpecializationKey(specParam);
        }

        if (sortParam && SORT_OPTIONS.some((option) => option.value === sortParam)) {
            setSort(sortParam);
        }

        if (pageParam && pageParam > 0) {
            setPage(pageParam);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- load specializations ---
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
                        (item) => item.slug?.toLowerCase() === keyLower || item.title.toLowerCase() === keyLower,
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

    const { items, total, languages, isLoading, error } = useTranslatorSearch({
        page,
        pageSize: PAGE_SIZE,
        sort,
        filters,
    });

    // --- accumulate language options ---
    useEffect(() => {
        if (!languages.length) return;
        setLanguageOptions((prev) => {
            const merged = new Set(prev);
            languages.forEach((lang) => merged.add(lang));
            return Array.from(merged).sort();
        });
    }, [languages]);

    // --- sync URL ---
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.languageFrom) params.set("from", filters.languageFrom);
        if (filters.languageTo) params.set("to", filters.languageTo);
        if (filters.specializationId) params.set("spec", String(filters.specializationId));
        if (filters.maxRate != null) params.set("maxRate", String(filters.maxRate));
        if (filters.minRating != null) params.set("minRating", String(filters.minRating));
        if (sort !== "relevance") params.set("sort", sort);
        if (page > 1) params.set("page", String(page));

        setSearchParams(params, { replace: true });
    }, [filters, sort, page, setSearchParams]);

    const handleFiltersChange = (patch: Partial<TranslatorSearchFilters>) => {
        setFilters((prev) => ({ ...prev, ...patch }));
        setPage(1);
    };

    const handleResetFilters = () => {
        setFilters({ ...DEFAULT_FILTERS });
        setPage(1);
    };

    const handleSortChange = (value: string) => {
        setSort(value as SortKey);
        setPage(1);
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const pageClamped = Math.min(page, totalPages);

    useEffect(() => {
        if (page !== pageClamped) {
            setPage(pageClamped);
        }
    }, [page, pageClamped]);

    const renderSkeletonCards = () =>
        Array.from({ length: 4 }).map((_, index) => (
            <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={120} />
                </Paper>
            </Grid>
        ));

    const renderEmptyState = () => (
        <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6">Ничего не найдено</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Измените параметры поиска или сбросьте фильтры.
                </Typography>
                <Button onClick={handleResetFilters} sx={{ mt: 2 }} variant="outlined">
                    Сбросить всё
                </Button>
            </Paper>
        </Grid>
    );

    return (
        <Container sx={{ py: { xs: 4, md: 6 } }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                    {isMdUp ? (
                        <Paper sx={{ border: "1px solid", borderColor: "divider" }}>
                            <SearchFilters
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                onReset={handleResetFilters}
                                specializationOptions={specializations}
                                languageOptions={languageOptions}
                                isLoading={isLoading || specializationsLoading}
                            />
                        </Paper>
                    ) : (
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Button variant="outlined" startIcon={<TuneRoundedIcon />} onClick={() => setFiltersDrawerOpen(true)}>
                                Фильтры
                            </Button>
                            <TextField
                                select
                                label="Сортировка"
                                value={sort}
                                onChange={(event) => handleSortChange(event.target.value)}
                                sx={{ minWidth: 170 }}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 9 }}>
                    {isMdUp && (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h5">Найдено: {total}</Typography>
                            <TextField
                                select
                                label="Сортировка"
                                value={sort}
                                onChange={(event) => handleSortChange(event.target.value)}
                                sx={{ minWidth: 220 }}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    )}

                    <Grid container spacing={2}>
                        {isLoading && items.length === 0 && renderSkeletonCards()}
                        {!isLoading &&
                            items.map((translator) => (
                                <Grid key={translator.id} size={{ xs: 12, sm: 6 }}>
                                    <TranslatorCard translator={translator} />
                                </Grid>
                            ))}
                        {!isLoading && !items.length && renderEmptyState()}
                    </Grid>

                    {error && (
                        <Paper sx={{ mt: 3, p: 3 }}>
                            <Typography color="error">{error}</Typography>
                        </Paper>
                    )}

                    {total > PAGE_SIZE && (
                        <Stack alignItems="center" sx={{ mt: 3 }}>
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

            <Drawer anchor="right" open={isFiltersDrawerOpen} onClose={() => setFiltersDrawerOpen(false)} PaperProps={{ sx: { width: 340 } }}>
                <Box sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Фильтры</Typography>
                        <IconButton onClick={() => setFiltersDrawerOpen(false)}>
                            <TuneRoundedIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <SearchFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                    specializationOptions={specializations}
                    languageOptions={languageOptions}
                    isLoading={isLoading || specializationsLoading}
                />
                <Box sx={{ p: 2, pt: 0 }}>
                    <Button fullWidth variant="contained" onClick={() => setFiltersDrawerOpen(false)}>
                        Применить
                    </Button>
                </Box>
            </Drawer>
        </Container>
    );
}
