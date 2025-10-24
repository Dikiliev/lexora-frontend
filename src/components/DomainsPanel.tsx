import { observer } from "mobx-react-lite";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { DOMAINS } from "../utils/constants";
import { filterStore } from "../stores/filterStore";
import { useNavigate } from "react-router-dom";

const DomainsPanel = observer(() => {
    const nav = useNavigate();

    return (
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
                <Stack spacing={0.5}>
                    <Typography variant="h6">Тематики</Typography>
                    <Typography color="text.secondary">Выберите профиль — результаты станут точнее</Typography>
                </Stack>
                <Button variant="outlined" onClick={() => nav("/search")}>Перейти в каталог</Button>
            </Stack>

            <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {DOMAINS.map((d) => (
                    <Chip
                        key={d}
                        label={d}
                        onClick={() => filterStore.toggleCategory(d)}
                        color={filterStore.categories.includes(d) ? "primary" : "default"}
                        sx={{ borderRadius: 999 }}
                    />
                ))}
            </Box>
        </Paper>
    );
});

export default DomainsPanel;
