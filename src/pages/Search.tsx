import { observer } from "mobx-react-lite";
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
    Stack,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import TranslatorCard from "../components/TranslatorCard";
import SearchFilters from "../components/SearchFilters";
import { translatorsStore } from "../stores/translatorsStore";
import { filterStore } from "../stores/filterStore";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type SortKey = "relevance" | "rating" | "rate_asc" | "rate_desc" | "verified";

const PAGE_SIZE = 12;

const Search = observer(() => {
    const isMdUp = useMediaQuery("(min-width:900px)");
    const [open, setOpen] = useState(false);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [sort, setSort] = useState<SortKey>("relevance");
    const [page, setPage] = useState(1);
    const [params, setParams] = useSearchParams();

    // ---- read from URL on mount or params change ----
    useEffect(() => {
        const from = params.get("from");
        const to = params.get("to");
        const cats = params.get("cats")?.split(",").filter(Boolean) ?? [];
        const min = params.get("min");
        const max = params.get("max");
        const s = (params.get("sort") as SortKey) || "relevance";
        const ver = params.get("ver") === "1";
        const p = Number(params.get("page") || "1");

        if (from !== null) filterStore.setFrom(from || null);
        if (to !== null) filterStore.setTo(to || null);
        if (cats.length) {
            // sync store categories (simple: reset then add)
            filterStore.categories = [];
            cats.forEach((c) => filterStore.toggleCategory(c));
        }
        if (min && max) filterStore.setRate([+min, +max]);
        setVerifiedOnly(ver);
        setSort(s);
        setPage(isNaN(p) || p < 1 ? 1 : p);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // once

    // ---- write to URL when filters/sort/page change ----
    useEffect(() => {
        const next = new URLSearchParams();
        if (filterStore.fromLang) next.set("from", filterStore.fromLang);
        if (filterStore.toLang) next.set("to", filterStore.toLang);
        if (filterStore.categories.length) next.set("cats", filterStore.categories.join(","));
        if (filterStore.rateRange) {
            next.set("min", String(filterStore.rateRange[0]));
            next.set("max", String(filterStore.rateRange[1]));
        }
        if (verifiedOnly) next.set("ver", "1");
        if (sort !== "relevance") next.set("sort", sort);
        if (page > 1) next.set("page", String(page));
        setParams(next, { replace: true });
    }, [verifiedOnly, sort, page, setParams]);

    // ---- results (local compute over mock data) ----
    const results = useMemo(() => {
        let list = translatorsStore.list.filter((t) => {
            const byFrom = !filterStore.fromLang || t.fromLang === filterStore.fromLang;
            const byTo = !filterStore.toLang || t.toLang === filterStore.toLang;
            const byRate = t.rate >= filterStore.rateRange[0] && t.rate <= filterStore.rateRange[1];
            const byCats =
                filterStore.categories.length === 0 || filterStore.categories.every((c) => t.categories.includes(c));
            const byVer = !verifiedOnly || Boolean(t.verified);
            return byFrom && byTo && byRate && byCats && byVer;
        });

        switch (sort) {
            case "rating":
                list = [...list].sort((a, b) => b.rating - a.rating);
                break;
            case "rate_asc":
                list = [...list].sort((a, b) => a.rate - b.rate);
                break;
            case "rate_desc":
                list = [...list].sort((a, b) => b.rate - a.rate);
                break;
            case "verified":
                list = [...list].sort((a, b) => Number(b.verified) - Number(a.verified));
                break;
            default:
                break;
        }

        return list;
    }, [verifiedOnly, sort, filterStore.fromLang, filterStore.toLang, filterStore.categories, filterStore.rateRange]);

    // ---- pagination ----
    const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
    const pageClamped = Math.min(page, totalPages);
    const pageSlice = results.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE);

    useEffect(() => {
        if (page !== pageClamped) setPage(pageClamped);
    }, [page, pageClamped]);

    const resetAll = () => {
        filterStore.reset();
        setVerifiedOnly(false);
        setSort("relevance");
        setPage(1);
    };

    return (
        <Container sx={{ py: { xs: 4, md: 6 } }}>
            <Grid container spacing={2}>
                {/* Sidebar */}
                <Grid size={{ xs: 12, md: 3 }}>
                    {isMdUp ? (
                        <Paper sx={{ border: "1px solid", borderColor: "divider" }}>
                            <SearchFilters verifiedOnly={verifiedOnly} onVerifiedChange={setVerifiedOnly} onReset={resetAll} />
                        </Paper>
                    ) : (
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Button variant="outlined" startIcon={<TuneRoundedIcon />} onClick={() => setOpen(true)}>
                                Фильтры
                            </Button>
                            <TextField
                                select
                                label="Сортировка"
                                value={sort}
                                onChange={(e) => setSort(e.target.value as SortKey)}
                                sx={{ minWidth: 170 }}
                            >
                                <MenuItem value="relevance">По релевантности</MenuItem>
                                <MenuItem value="rating">По рейтингу</MenuItem>
                                <MenuItem value="rate_asc">Ставка ↑</MenuItem>
                                <MenuItem value="rate_desc">Ставка ↓</MenuItem>
                                <MenuItem value="verified">Проверенные</MenuItem>
                            </TextField>
                        </Stack>
                    )}
                </Grid>

                {/* Results */}
                <Grid size={{ xs: 12, md: 9 }}>
                    {/* Top bar (desktop) */}
                    {isMdUp && (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h5">Найдено: {results.length}</Typography>
                            <TextField
                                select
                                label="Сортировка"
                                value={sort}
                                onChange={(e) => setSort(e.target.value as SortKey)}
                                sx={{ minWidth: 220 }}
                            >
                                <MenuItem value="relevance">По релевантности</MenuItem>
                                <MenuItem value="rating">По рейтингу</MenuItem>
                                <MenuItem value="rate_asc">Ставка ↑</MenuItem>
                                <MenuItem value="rate_desc">Ставка ↓</MenuItem>
                                <MenuItem value="verified">Проверенные</MenuItem>
                            </TextField>
                        </Stack>
                    )}

                    {/* Cards */}
                    <Grid container spacing={2}>
                        {pageSlice.map((t) => (
                            <Grid key={t.id} size={{ xs: 12, sm: 6 }}>
                                <TranslatorCard t={t} />
                            </Grid>
                        ))}

                        {results.length === 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 4, textAlign: "center" }}>
                                    <Typography variant="h6">Ничего не найдено</Typography>
                                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                        Измените параметры поиска или сбросьте фильтры.
                                    </Typography>
                                    <Button onClick={resetAll} sx={{ mt: 2 }} variant="outlined">
                                        Сбросить всё
                                    </Button>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>

                    {/* Pagination */}
                    {results.length > PAGE_SIZE && (
                        <Stack alignItems="center" sx={{ mt: 3 }}>
                            <Pagination
                                count={totalPages}
                                page={pageClamped}
                                onChange={(_, p) => setPage(p)}
                                color="primary"
                            />
                        </Stack>
                    )}
                </Grid>
            </Grid>

            {/* Mobile filters drawer */}
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{ sx: { width: 340 } }}
            >
                <Box sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Фильтры</Typography>
                        <IconButton onClick={() => setOpen(false)}>
                            <TuneRoundedIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <SearchFilters verifiedOnly={verifiedOnly} onVerifiedChange={setVerifiedOnly} onReset={resetAll} />
                <Box sx={{ p: 2, pt: 0 }}>
                    <Button fullWidth variant="contained" onClick={() => setOpen(false)}>
                        Применить
                    </Button>
                </Box>
            </Drawer>
        </Container>
    );
});

export default Search;
