import { Autocomplete, Box, Button, MenuItem, Slider, Stack, TextField, Typography } from "@mui/material";
import type { SpecializationOption } from "../pages/translator-settings/types";
import type { TranslatorSearchFilters } from "../pages/search/useTranslatorSearch";

interface SearchFiltersProps {
    filters: TranslatorSearchFilters;
    onFiltersChange: (patch: Partial<TranslatorSearchFilters>) => void;
    onReset: () => void;
    specializationOptions: SpecializationOption[];
    languageOptions: string[];
    isLoading?: boolean;
}

function normalizeLanguage(value: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

const SearchFilters = ({
    filters,
    onFiltersChange,
    onReset,
    specializationOptions,
    languageOptions,
    isLoading,
}: SearchFiltersProps) => {
    const handleLanguageChange = (key: "languageFrom" | "languageTo") => (_: unknown, value: string | null) => {
        onFiltersChange({ [key]: normalizeLanguage(value) });
    };

    const handleLanguageInputChange = (key: "languageFrom" | "languageTo") => (_: unknown, value: string) => {
        onFiltersChange({ [key]: normalizeLanguage(value) });
    };

    return (
        <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5}>
                <Typography variant="h6">Фильтры</Typography>

                <Autocomplete
                    freeSolo
                    options={languageOptions}
                    value={filters.languageFrom ?? ""}
                    onChange={handleLanguageChange("languageFrom")}
                    onInputChange={handleLanguageInputChange("languageFrom")}
                    loading={isLoading}
                    renderInput={(params) => <TextField {...params} label="С языка" placeholder="Например: en" />}
                />

                <Autocomplete
                    freeSolo
                    options={languageOptions}
                    value={filters.languageTo ?? ""}
                    onChange={handleLanguageChange("languageTo")}
                    onInputChange={handleLanguageInputChange("languageTo")}
                    loading={isLoading}
                    renderInput={(params) => <TextField {...params} label="На язык" placeholder="Например: ru" />}
                />

                <TextField
                    select
                    label="Специализация"
                    value={filters.specializationId ?? ""}
                    onChange={(event) =>
                        onFiltersChange({
                            specializationId: event.target.value === "" ? null : Number(event.target.value),
                        })
                    }
                >
                    <MenuItem value="">Все</MenuItem>
                    {specializationOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                            {option.title}
                        </MenuItem>
                    ))}
                </TextField>

                <Stack spacing={1}>
                    <Typography variant="subtitle2">Максимальная ставка (за час)</Typography>
                    <TextField
                        type="number"
                        inputProps={{ min: 0 }}
                        value={filters.maxRate ?? ""}
                        onChange={(event) =>
                            onFiltersChange({
                                maxRate: event.target.value === "" ? null : Number(event.target.value),
                            })
                        }
                        placeholder="Не ограничено"
                    />
                </Stack>

                <Stack spacing={1}>
                    <Typography variant="subtitle2">Минимальный рейтинг</Typography>
                    <Slider
                        value={filters.minRating ?? 0}
                        min={0}
                        max={5}
                        step={0.5}
                        onChange={(_, value) => onFiltersChange({ minRating: Number(value) })}
                    />
                    <Typography color="text.secondary">{filters.minRating ?? 0}+</Typography>
                </Stack>

                <Button variant="text" color="inherit" onClick={onReset} sx={{ alignSelf: "flex-start" }}>
                    Сбросить фильтры
                </Button>
            </Stack>
        </Box>
    );
};

export default SearchFilters;
