import { observer } from "mobx-react-lite";
import {
    Autocomplete, Box, Button, Chip, Divider, Slider, Stack, TextField, Typography
} from "@mui/material";
import { LANGS, DOMAINS } from "../utils/constants";
import { filterStore } from "../stores/filterStore";

const FiltersPanel = observer(({ onSearch }: { onSearch?: () => void }) => {
    return (
        <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: "background.paper", border: "1px solid #E5E7EB" }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
                <Autocomplete
                    sx={{ flex: 1 }}
                    options={LANGS}
                    value={filterStore.fromLang}
                    onChange={(_, v) => filterStore.setFrom(v)}
                    renderInput={(p) => <TextField {...p} label="С языка" placeholder="Выберите" />}
                />
                <Autocomplete
                    sx={{ flex: 1 }}
                    options={LANGS}
                    value={filterStore.toLang}
                    onChange={(_, v) => filterStore.setTo(v)}
                    renderInput={(p) => <TextField {...p} label="На язык" placeholder="Выберите" />}
                />
                <Button onClick={onSearch} variant="contained" size="large" sx={{ minWidth: 180 }}>
                    Найти
                </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
            >
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {DOMAINS.map((d) => (
                        <Chip
                            key={d}
                            label={d}
                            onClick={() => filterStore.toggleCategory(d)}
                            color={filterStore.categories.includes(d) ? "primary" : "default"}
                            sx={{ mr: 0.5, mb: 1 }}
                        />
                    ))}
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 260 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                        Ставка ₽/час
                    </Typography>
                    <Slider
                        value={filterStore.rateRange}
                        min={500}
                        max={4000}
                        step={50}
                        onChange={(_, v) => filterStore.setRate(v as number[])}
                        sx={{ width: 220 }}
                    />
                </Stack>
            </Stack>
        </Box>
    );
});

export default FiltersPanel;
