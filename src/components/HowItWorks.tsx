import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";

const STEPS = [
    { icon: <SearchRoundedIcon />, title: "Поиск", text: "Выберите языковую пару и тематику." },
    { icon: <FilterAltRoundedIcon />, title: "Фильтры", text: "Настройте ставку и опыт — получите совпадения." },
    { icon: <AssignmentTurnedInRoundedIcon />, title: "Контакт", text: "Договоритесь напрямую и запускайте работу." },
];

export default function HowItWorks() {
    return (
        <Grid container spacing={2}>
            {STEPS.map((s, i) => (
                <Grid key={s.title} size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2.5, position: "relative", overflow: "hidden" }}>
                        {/* номер и иконка */}
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                            <Box
                                sx={{
                                    width: 36, height: 36, borderRadius: "50%",
                                    border: "2px solid", borderColor: "primary.main",
                                    display: "grid", placeItems: "center",
                                    fontWeight: 800,
                                }}
                            >
                                {i + 1}
                            </Box>
                            <Box
                                sx={{
                                    width: 36, height: 36, borderRadius: 1.2,
                                    bgcolor: "background.paper", border: "1px solid", borderColor: "divider",
                                    display: "grid", placeItems: "center",
                                }}
                            >
                                {s.icon}
                            </Box>
                        </Stack>

                        <Typography variant="h6">{s.title}</Typography>
                        <Typography color="text.secondary">{s.text}</Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}
