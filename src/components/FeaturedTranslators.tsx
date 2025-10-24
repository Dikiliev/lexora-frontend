import { observer } from "mobx-react-lite";
import { Button, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TranslatorCard from "./TranslatorCard"; // уже есть у тебя
import { translatorsStore } from "../stores/translatorsStore";

const FeaturedTranslators = observer(() => {
    const nav = useNavigate();
    const list = translatorsStore.list.slice(0, 4);

    return (
        <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h2">Избранные переводчики</Typography>
                <Button variant="outlined" onClick={() => nav("/search")}>Смотреть всех</Button>
            </Stack>
            <Grid container spacing={2}>
                {list.map((t) => (
                    <Grid key={t.id} size={{ xs: 12, md: 6 }}>
                        <TranslatorCard t={t} />
                    </Grid>
                ))}
            </Grid>
        </Stack>
    );
});

export default FeaturedTranslators;
