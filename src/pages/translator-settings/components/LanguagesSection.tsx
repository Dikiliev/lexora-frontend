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
import type { LanguageFormState, LanguagePairDTO } from "../types";
import {
    CURRENCY_OPTIONS,
    LANGUAGE_OPTIONS,
    LANGUAGES_EMPTY_NOTE,
} from "../constants";

interface LanguagesSectionProps {
    languages: LanguageFormState[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onChange: (
        id: string,
        field: keyof LanguagePairDTO,
        value: string,
    ) => void;
    onCurrencyChange: (id: string, value: string) => void;
    fallbackCurrency: string;
}

export function LanguagesSection({
    languages,
    onAdd,
    onRemove,
    onChange,
    onCurrencyChange,
    fallbackCurrency,
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
                                options={[...LANGUAGE_OPTIONS]}
                                freeSolo
                                value={language.language_from ?? ""}
                                onInputChange={(_event, value) =>
                                    onChange(language.id, "language_from", value)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Исходный язык"
                                        placeholder="Например: EN"
                                        required
                                        fullWidth
                                    />
                                )}
                                fullWidth
                            />
                            <Autocomplete
                                options={[...LANGUAGE_OPTIONS]}
                                freeSolo
                                value={language.language_to ?? ""}
                                onInputChange={(_event, value) =>
                                    onChange(language.id, "language_to", value)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Язык перевода"
                                        placeholder="Например: RU"
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
                                value={language.currency ?? fallbackCurrency}
                                onChange={(event) =>
                                    onCurrencyChange(
                                        language.id,
                                        event.target.value,
                                    )
                                }
                                fullWidth
                            >
                                {CURRENCY_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
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
