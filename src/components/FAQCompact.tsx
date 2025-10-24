import { Grid, Paper, Typography } from "@mui/material";

const QA = [
    { q: "Как выбрать переводчика?", a: "Задайте языковую пару, тематику и бюджет — система отфильтрует подходящих." },
    { q: "Как проверяется качество?", a: "Профили верифицируются тестами и отзывами. Отмечены значком “Проверен”." },
    { q: "Есть ли гарантия сроков?", a: "Указывайте дедлайны в заказе — исполнитель подтверждает сроки перед началом." },
    { q: "Можно опубликовать задачу?", a: "Да. Разместите заказ — откликнутся релевантные специалисты." },
];

export default function FAQCompact() {
    return (
        <Grid container spacing={2}>
            {QA.map((i) => (
                <Grid key={i.q} size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography fontWeight={800}>{i.q}</Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>{i.a}</Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}
