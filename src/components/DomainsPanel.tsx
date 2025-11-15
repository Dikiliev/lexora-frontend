import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const DOMAINS = [
    "Медицина",
    "Финансы",
    "Юриспруденция",
    "IT",
    "Маркетинг",
    "Техника",
    "Игры",
    "Наука",
];

const DomainsPanel = () => {
    const navigate = useNavigate();

    const handleNavigate = (domain: string) => {
        navigate({
            pathname: "/search",
            search: `?spec=${encodeURIComponent(domain.toLowerCase())}`,
        });
    };

    return (
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={2}
            >
                <Stack spacing={0.5}>
                    <Typography variant="h6">Тематики</Typography>
                    <Typography color="text.secondary">Выберите профиль — результаты станут точнее</Typography>
                </Stack>
                <Button variant="outlined" onClick={() => navigate("/search")}>
                    Перейти в каталог
                </Button>
            </Stack>

            <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {DOMAINS.map((domain) => (
                    <Chip
                        key={domain}
                        label={domain}
                        onClick={() => handleNavigate(domain)}
                        sx={{ borderRadius: 999 }}
                    />
                ))}
            </Box>
        </Paper>
    );
};

export default DomainsPanel;
