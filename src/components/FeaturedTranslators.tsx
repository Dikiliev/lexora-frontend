import { Button, Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TranslatorCard from "./TranslatorCard";
import { useTranslatorSearch } from "../pages/search/useTranslatorSearch";

const FeaturedTranslators = () => {
    const navigate = useNavigate();
    const filters = useMemo(
        () => ({
            languageFrom: null,
            languageTo: null,
            specializationId: null,
            maxRate: null,
            minRating: null,
            search: null,
        }),
        [],
    );

    const { items, isLoading } = useTranslatorSearch({
        page: 1,
        pageSize: 4,
        sort: "rating_desc",
        filters,
    });

    const content = useMemo(() => {
        if (isLoading) {
            return Array.from({ length: 4 }).map((_, index) => (
                <Grid key={`featured-skeleton-${index}`} size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2 }}>
                        <Skeleton variant="rectangular" height={120} />
                    </Paper>
                </Grid>
            ));
        }

        return items.map((translator) => (
            <Grid key={translator.id} size={{ xs: 12, md: 6 }}>
                <TranslatorCard translator={translator} />
            </Grid>
        ));
    }, [isLoading, items]);

    return (
        <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h2">Избранные переводчики</Typography>
                <Button variant="outlined" onClick={() => navigate("/search")}>
                    Смотреть всех
                </Button>
            </Stack>
            <Grid container spacing={2}>{content}</Grid>
        </Stack>
    );
};

export default FeaturedTranslators;
