import { Autocomplete, Paper, Stack, TextField, Typography, MenuItem } from "@mui/material";
import { CURRENCY_OPTIONS, SPECIALIZATIONS_EMPTY_NOTE } from "../constants";
import type { SpecializationMetaMap, SpecializationOption } from "../types";

interface SpecializationsSectionProps {
    options: SpecializationOption[];
    selected: SpecializationOption[];
    meta: SpecializationMetaMap;
    fallbackCurrency: string;
    onSelectionChange: (items: SpecializationOption[]) => void;
    onMetaChange: (id: number, field: "rate" | "currency" | "note", value: string) => void;
}

export function SpecializationsSection({
    options,
    selected,
    meta,
    fallbackCurrency,
    onSelectionChange,
    onMetaChange,
}: SpecializationsSectionProps) {
    return (
        <Stack spacing={2}>
            <Typography variant="h6" fontWeight={700}>
                Специализации
            </Typography>
            <Autocomplete
                multiple
                options={options}
                value={selected}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => <TextField {...params} label="Специализации" placeholder="Выберите специализации" />}
                onChange={(_event, value) => onSelectionChange(value)}
            />
            <Stack spacing={2}>
                {selected.length === 0 && <Typography color="text.secondary">{SPECIALIZATIONS_EMPTY_NOTE}</Typography>}
                {selected.map((spec) => (
                    <Paper key={spec.id} variant="outlined" sx={{ p: 2, borderRadius: 3, display: "grid", gap: 2 }}>
                        <Typography fontWeight={700}>{spec.title}</Typography>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField
                                label="Ставка"
                                type="number"
                                value={meta[spec.id]?.rate ?? ""}
                                onChange={(event) => onMetaChange(spec.id, "rate", event.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Валюта"
                                select
                                value={meta[spec.id]?.currency ?? fallbackCurrency}
                                onChange={(event) => onMetaChange(spec.id, "currency", event.target.value)}
                                fullWidth
                            >
                                {CURRENCY_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                        <TextField
                            label="Комментарий"
                            value={meta[spec.id]?.note ?? ""}
                            onChange={(event) => onMetaChange(spec.id, "note", event.target.value)}
                            multiline
                            minRows={2}
                        />
                    </Paper>
                ))}
            </Stack>
        </Stack>
    );
}

