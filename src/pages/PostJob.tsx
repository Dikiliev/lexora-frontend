import { Box, Button, Stack, TextField, Typography } from "@mui/material";

export default function PostJob() {
    return (
        <Stack spacing={3}>
            <Typography variant="h2">Разместить заказ</Typography>
            <Box
                component="form"
                onSubmit={(e) => e.preventDefault()}
                sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}
            >
                <TextField label="Название проекта" fullWidth />
                <TextField label="Домен / тематика" fullWidth />
                <TextField label="Язык исходника" fullWidth />
                <TextField label="Язык перевода" fullWidth />
                <TextField label="Бюджет (₽)" type="number" fullWidth />
                <TextField label="Сроки" fullWidth />
                <TextField
                    label="Описание"
                    fullWidth
                    multiline
                    minRows={4}
                    sx={{ gridColumn: { md: "1 / span 2" } }}
                />
                <Button type="submit" variant="contained" sx={{ gridColumn: { md: "1 / span 2" }, justifySelf: "start" }}>
                    Опубликовать
                </Button>
            </Box>
        </Stack>
    );
}
