import { observer } from "mobx-react-lite";
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Divider,
    FormControlLabel,
    Slider,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { LANGS, DOMAINS } from "../utils/constants";
import { filterStore } from "../stores/filterStore";

type Props = {
    verifiedOnly: boolean;
    onVerifiedChange: (v: boolean) => void;
    onReset?: () => void;
};

const SearchFilters = observer(({ verifiedOnly, onVerifiedChange, onReset }: Props) => {
    return (
        <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5}>
                <Typography variant="h6">Фильтры</Typography>

                <Autocomplete
                    options={LANGS}
                    value={filterStore.fromLang}
                    onChange={(_, v) => filterStore.setFrom(v)}
                    renderInput={(p) => <TextField {...p} label="С языка" placeholder="Выберите" />}
                />

                <Autocomplete
                    options={LANGS}
                    value={filterStore.toLang}
                    onChange={(_, v) => filterStore.setTo(v)}
                    renderInput={(p) => <TextField {...p} label="На язык" placeholder="Выберите" />}
                />

                <Divider />

                <Stack spacing={1}>
                    <Typography variant="subtitle2">Тематики</Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                </Stack>

                <Stack spacing={1}>
                    <Typography variant="subtitle2">Ставка (₽/час)</Typography>
                    <Slider
                        value={filterStore.rateRange}
                        min={500}
                        max={4000}
                        step={50}
                        onChange={(_, v) => filterStore.setRate(v as number[])}
                    />
                    <Typography color="text.secondary">
                        {filterStore.rateRange[0]}–{filterStore.rateRange[1]} ₽
                    </Typography>
                </Stack>

                <FormControlLabel
                    control={<Switch checked={verifiedOnly} onChange={(e) => onVerifiedChange(e.target.checked)} />}
                    label="Только проверенные"
                />

                <Button variant="text" color="inherit" onClick={onReset} sx={{ alignSelf: "flex-start" }}>
                    Сбросить фильтры
                </Button>
            </Stack>
        </Box>
    );
});

export default SearchFilters;
