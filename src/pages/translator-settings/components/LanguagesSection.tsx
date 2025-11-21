import {
    Autocomplete,
    Button,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import type { Currency, Language, LanguageFormState } from "../types";
import { LANGUAGES_EMPTY_NOTE } from "../constants";

interface LanguagesSectionProps {
    languages: LanguageFormState[];
    availableLanguages: Language[];
    availableCurrencies: Currency[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onChange: (
        id: string,
        field: keyof LanguageFormState,
        value: string | number | null,
    ) => void;
    onCurrencyChange: (id: string, value: number | null) => void;
    fallbackCurrencyId: number | null;
}

export function LanguagesSection({
    languages,
    availableLanguages,
    availableCurrencies,
    onAdd,
    onRemove,
    onChange,
    onCurrencyChange,
    fallbackCurrencyId,
}: LanguagesSectionProps) {
    const isEmpty = languages.length === 0;

    return (
        <Stack spacing={2.25}>
            {/* Заголовок блока */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={700}>
                        Языковые пары
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Укажите основные направления перевода и ставки для
                        каждой пары.
                    </Typography>
                </Stack>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddCircleOutlineRoundedIcon />}
                    onClick={onAdd}
                >
                    Добавить пару
                </Button>
            </Stack>

            {/* Список пар */}
            <Stack spacing={1.5}>
                {isEmpty && (
                    <Typography color="text.secondary" variant="body2">
                        {LANGUAGES_EMPTY_NOTE}
                    </Typography>
                )}

                {languages.map((language, index) => (
                    <Paper
                        key={language.id}
                        variant="outlined"
                        sx={{
                            p: 2,
                            display: "grid",
                            gap: 2,
                        }}
                    >
                        {/* Хедер карточки пары */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mb: 0.5 }}
                        >
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                Пара {index + 1}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => onRemove(language.id)}
                            >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                        </Stack>

                        {/* Языки */}
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                        >
                            <Autocomplete
                                options={availableLanguages}
                                getOptionLabel={(option) => option.name}
                                value={
                                    availableLanguages.find(
                                        (lang) => lang.id === language.language_from_id,
                                    ) ?? null
                                }
                                onChange={(_event, value) =>
                                    onChange(language.id, "language_from_id", value?.id ?? null)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Исходный язык"
                                        placeholder="Выберите язык"
                                        required
                                        fullWidth
                                    />
                                )}
                                fullWidth
                            />
                            <Autocomplete
                                options={availableLanguages}
                                getOptionLabel={(option) => option.name}
                                value={
                                    availableLanguages.find(
                                        (lang) => lang.id === language.language_to_id,
                                    ) ?? null
                                }
                                onChange={(_event, value) =>
                                    onChange(language.id, "language_to_id", value?.id ?? null)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Язык перевода"
                                        placeholder="Выберите язык"
                                        required
                                        fullWidth
                                    />
                                )}
                                fullWidth
                            />
                        </Stack>

                        {/* Ставки */}
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                        >
                            <TextField
                                label="Ставка за слово"
                                type="number"
                                value={language.price_per_word ?? ""}
                                onChange={(event) =>
                                    onChange(
                                        language.id,
                                        "price_per_word",
                                        event.target.value,
                                    )
                                }
                                placeholder="Например: 3.5"
                                fullWidth
                            />
                            <TextField
                                label="Ставка в час"
                                type="number"
                                value={language.price_per_hour ?? ""}
                                onChange={(event) =>
                                    onChange(
                                        language.id,
                                        "price_per_hour",
                                        event.target.value,
                                    )
                                }
                                placeholder="Например: 1200"
                                fullWidth
                            />
                            <TextField
                                label="Валюта"
                                select
                                value={language.currency_id ?? fallbackCurrencyId ?? ""}
                                onChange={(event) =>
                                    onCurrencyChange(
                                        language.id,
                                        event.target.value === "" ? null : Number(event.target.value),
                                    )
                                }
                                fullWidth
                            >
                                {availableCurrencies.map((currency) => (
                                    <MenuItem key={currency.id} value={currency.id}>
                                        {currency.code} ({currency.name})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </Stack>
    );
}
