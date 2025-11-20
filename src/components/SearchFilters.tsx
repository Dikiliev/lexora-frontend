import {
    Autocomplete,
    Button,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Rating,
} from "@mui/material";
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

const RATING_OPTIONS: Array<{ value: number | null; label: string }> = [
    { value: null, label: "Любой" },
    { value: 3, label: "3.0+" },
    { value: 4, label: "4.0+" },
    { value: 4.5, label: "4.5+" },
    { value: 5, label: "5.0" },
];

const SearchFilters = ({
    filters,
    onFiltersChange,
    onReset,
    specializationOptions,
    languageOptions,
    isLoading,
}: SearchFiltersProps) => {
    const handleLanguageChange =
        (key: "languageFrom" | "languageTo") =>
        (_: unknown, value: string | null) => {
            onFiltersChange({ [key]: normalizeLanguage(value) });
        };

    const handleLanguageInputChange =
        (key: "languageFrom" | "languageTo") =>
        (_: unknown, value: string) => {
            onFiltersChange({ [key]: normalizeLanguage(value) });
        };

    const specializationValue = filters.specializationId ?? "";
    const selectedRating = filters.minRating ?? null;

    return (
        <Stack spacing={2}>
            {/* Языковые пары */}
            <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                    Языковая пара
                </Typography>

                <Autocomplete
                    freeSolo
                    options={languageOptions}
                    value={filters.languageFrom ?? ""}
                    onChange={handleLanguageChange("languageFrom")}
                    onInputChange={handleLanguageInputChange("languageFrom")}
                    loading={isLoading}
                    size="small"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="С языка"
                            placeholder="Например: en"
                            size="small"
                        />
                    )}
                />

                <Autocomplete
                    freeSolo
                    options={languageOptions}
                    value={filters.languageTo ?? ""}
                    onChange={handleLanguageChange("languageTo")}
                    onInputChange={handleLanguageInputChange("languageTo")}
                    loading={isLoading}
                    size="small"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="На язык"
                            placeholder="Например: ru"
                            size="small"
                        />
                    )}
                />
            </Stack>

            {/* Специализация */}
            <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary">
                    Специализация
                </Typography>
                <TextField
                    select
                    size="small"
                    value={specializationValue}
                    onChange={(event) => {
                        const value = event.target.value;
                        onFiltersChange({
                            specializationId: value === "" ? null : Number(value),
                        });
                    }}
                    SelectProps={{
                        displayEmpty: true,
                        renderValue: (selected) => {
                            if (selected === "" || selected == null) {
                                return "Все специализации";
                            }
                            const option = specializationOptions.find(
                                (opt) => opt.id === Number(selected),
                            );
                            return option?.title ?? "Все специализации";
                        },
                    }}
                >
                    <MenuItem value="">Все специализации</MenuItem>
                    {specializationOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                            {option.title}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            {/* Ставка */}
            <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary">
                    Максимальная ставка (за час)
                </Typography>
                <TextField
                    type="number"
                    size="small"
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

            {/* Минимальный рейтинг */}
            <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary">
                    Минимальный рейтинг
                </Typography>
                <TextField
                    select
                    size="small"
                    value={selectedRating ?? ""}
                    onChange={(event) => {
                        const value = event.target.value;
                        onFiltersChange({
                            minRating: value === "" ? null : Number(value),
                        });
                    }}
                    SelectProps={{
                        displayEmpty: true,
                        renderValue: (selected) => {
                            if (selected === "" || selected == null) {
                                return "Любой";
                            }
                            const num = Number(selected);
                            const option = RATING_OPTIONS.find((o) => o.value === num);
                            return option?.label ?? "Любой";
                        },
                    }}
                >
                    {RATING_OPTIONS.map((option) => (
                        <MenuItem key={option.label} value={option.value ?? ""}>
                            {option.value == null ? (
                                <Typography variant="body2">Любой</Typography>
                            ) : (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Rating
                                        value={option.value}
                                        precision={0.5}
                                        readOnly
                                        size="small"
                                        sx={{
                                            "& .MuiRating-iconFilled": {
                                                color: "primary.main",
                                            },
                                        }}
                                    />
                                    <Typography variant="body2">{option.label}</Typography>
                                </Stack>
                            )}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            {/* Сброс */}
            <Button
                variant="text"
                color="inherit"
                onClick={onReset}
                size="small"
                sx={{ alignSelf: "flex-start", mt: 0.5 }}
            >
                Сбросить фильтры
            </Button>
        </Stack>
    );
};

export default SearchFilters;
