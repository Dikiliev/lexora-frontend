import {
    Autocomplete,
    Button,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type { Language, SpecializationOption } from "../pages/translator-settings/types";
import type { OrderSearchFilters } from "../pages/orders/useOrderSearch";

interface OrderFiltersProps {
    filters: OrderSearchFilters;
    onFiltersChange: (patch: Partial<OrderSearchFilters>) => void;
    onReset: () => void;
    specializationOptions: SpecializationOption[];
    languageOptions: Language[];
    isLoading?: boolean;
}

const STATUS_OPTIONS: Array<{ value: string | null; label: string }> = [
    { value: null, label: "Любой" },
    { value: "published", label: "Опубликован" },
    { value: "candidate_found", label: "Кандидат найден" },
    { value: "in_progress", label: "В работе" },
    { value: "review", label: "На проверке" },
    { value: "done", label: "Завершён" },
];

const OrderFilters = ({
    filters,
    onFiltersChange,
    onReset,
    specializationOptions,
    languageOptions,
    isLoading,
}: OrderFiltersProps) => {
    const handleLanguageChange =
        (key: "languageFrom" | "languageTo") =>
        (_: unknown, value: Language | null) => {
            onFiltersChange({ [key]: value?.id ?? null });
        };

    const specializationValue = filters.specializationId ?? "";
    const selectedStatus = filters.status ?? null;
    
    // Защита от не-массивов
    const safeSpecializations = Array.isArray(specializationOptions) ? specializationOptions : [];
    const safeLanguages = Array.isArray(languageOptions) ? languageOptions : [];

    return (
        <Stack spacing={2}>
            <Typography variant="h6">Фильтры</Typography>

            {/* Языковые пары */}
            <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                    Языковая пара
                </Typography>

                <Autocomplete
                    options={safeLanguages}
                    getOptionLabel={(option) => option.name}
                    value={safeLanguages.find((lang) => lang.id === filters.languageFrom) ?? null}
                    onChange={handleLanguageChange("languageFrom")}
                    loading={isLoading}
                    size="small"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="С языка"
                            placeholder="Выберите язык"
                            size="small"
                        />
                    )}
                />

                <Autocomplete
                    options={safeLanguages}
                    getOptionLabel={(option) => option.name}
                    value={safeLanguages.find((lang) => lang.id === filters.languageTo) ?? null}
                    onChange={handleLanguageChange("languageTo")}
                    loading={isLoading}
                    size="small"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="На язык"
                            placeholder="Выберите язык"
                            size="small"
                        />
                    )}
                />
            </Stack>

            {/* Специализация */}
            <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                    Специализация
                </Typography>
                <TextField
                    select
                    value={specializationValue}
                    onChange={(e) =>
                        onFiltersChange({
                            specializationId: e.target.value ? Number(e.target.value) : null,
                        })
                    }
                    size="small"
                    fullWidth
                >
                    <MenuItem value="">Любая</MenuItem>
                    {safeSpecializations.map((spec) => (
                        <MenuItem key={spec.id} value={spec.id}>
                            {spec.title}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            {/* Статус */}
            <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                    Статус
                </Typography>
                <TextField
                    select
                    value={selectedStatus ?? ""}
                    onChange={(e) =>
                        onFiltersChange({
                            status: e.target.value || null,
                        })
                    }
                    size="small"
                    fullWidth
                >
                    {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value ?? "all"} value={option.value ?? ""}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            {/* Бюджет */}
            <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                    Бюджет
                </Typography>
                <TextField
                    type="number"
                    label="От"
                    value={filters.minPrice ?? ""}
                    onChange={(e) =>
                        onFiltersChange({
                            minPrice: e.target.value ? Number(e.target.value) : null,
                        })
                    }
                    size="small"
                    fullWidth
                />
                <TextField
                    type="number"
                    label="До"
                    value={filters.maxPrice ?? ""}
                    onChange={(e) =>
                        onFiltersChange({
                            maxPrice: e.target.value ? Number(e.target.value) : null,
                        })
                    }
                    size="small"
                    fullWidth
                />
            </Stack>

            <Button variant="outlined" onClick={onReset} fullWidth>
                Сбросить фильтры
            </Button>
        </Stack>
    );
};

export default OrderFilters;

