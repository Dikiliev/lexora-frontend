import { Avatar, Grid, Paper, Stack, Typography } from "@mui/material";

const QUOTES = [
    {
        name: "Анна К.",
        role: "PM, HealthTech",
        text: "За 30 минут нашли медицинского переводчика с релевантным опытом. Проект закрылся за 2 дня.",
    },
    {
        name: "Иван И.",
        role: "Юрист, FinTech",
        text: "Фильтры по доменам и ставке реально экономят время. Никакого спама — только подходящие профили.",
    },
    {
        name: "María G.",
        role: "Marketing Lead",
        text: "Удобный интерфейс, быстрые отклики. Вернулась к тем же специалистам через месяц.",
    },
];

export default function Testimonials() {
    return (
        <Grid container spacing={2}>
            {QUOTES.map((q, i) => (
                <Grid key={i} size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2.5, height: "100%" }}>
                        <Typography sx={{ fontSize: 48, lineHeight: 0.6, color: "primary.main" }}>“</Typography>
                        <Typography sx={{ mt: -2 }} color="text.primary">{q.text}</Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                            <Avatar />
                            <Stack>
                                <Typography fontWeight={700}>{q.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{q.role}</Typography>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}
