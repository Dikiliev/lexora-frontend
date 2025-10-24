import { Box, Grid, Stack, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";

const DEFAULT = [
    { icon: <SearchRoundedIcon />, title: "Поиск", text: "Выберите языки и тематику." },
    { icon: <FilterAltRoundedIcon />, title: "Фильтры", text: "Настройте ставку и опыт." },
    { icon: <AssignmentTurnedInRoundedIcon />, title: "Готово", text: "Свяжитесь с подходящими специалистами." },
];

export default function Steps({ items = DEFAULT }: { items?: { icon: React.ReactNode; title: string; text: string }[] }) {
    return (
        <Grid container spacing={2}>
            {items.map((s, i) => (
                <Grid key={i} size={{ xs: 12, md: 4 }}>
                    <Stack spacing={1.2} sx={{ p: 2 }}>
                        <Box sx={{
                            width: 48, height: 48, borderRadius: 2,
                            bgcolor: "background.paper", border: "1px solid", borderColor: "divider",
                            display: "grid", placeItems: "center",
                        }}>
                            {s.icon}
                        </Box>
                        <Typography variant="h6">{s.title}</Typography>
                        <Typography color="text.secondary">{s.text}</Typography>
                    </Stack>
                </Grid>
            ))}
        </Grid>
    );
}
