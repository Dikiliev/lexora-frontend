import { useParams } from "react-router-dom";
import { translatorsStore } from "../stores/translatorsStore";
import { Box, Chip, Divider, Rating, Stack, Typography } from "@mui/material";

export default function Profile() {
    const { id } = useParams();
    const t = translatorsStore.list.find((x) => x.id === id);

    if (!t) return <Typography>Переводчик не найден</Typography>;

    return (
        <Stack spacing={2}>
            <Typography variant="h2">{t.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
                {t.fromLang} → {t.toLang}
            </Typography>
            <Stack direction="row" spacing={1}>{t.categories.map((c) => <Chip key={c} label={c} />)}</Stack>
            <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h5">₽{t.rate}/час</Typography>
                <Rating value={t.rating} precision={0.1} readOnly />
            </Stack>
            <Divider />
            <Box>
                <Typography variant="h6">О специалисте</Typography>
                <Typography color="text.secondary">
                    {t.bio || "Опыт локализации и профильные тесты. Детали и портфолио будут подключены к бэку."}
                </Typography>
            </Box>
        </Stack>
    );
}
