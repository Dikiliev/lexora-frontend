import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Container,
    FormControlLabel,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useLanguages } from "../hooks/useLanguages";
import { useCurrencies } from "../hooks/useCurrencies";
import { request } from "../utils/api";
import type { Language, SpecializationOption } from "./translator-settings/types";
import type { OrderDTO } from "./orders/useOrderSearch";

export default function PostJob() {
    const navigate = useNavigate();
    const { languages } = useLanguages();
    const { currencies } = useCurrencies();

    const [topic, setTopic] = useState("");
    const [languageFrom, setLanguageFrom] = useState<Language | null>(null);
    const [languageTo, setLanguageTo] = useState<Language | null>(null);
    const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
    const [selectedSpecializations, setSelectedSpecializations] = useState<SpecializationOption[]>([]);
    const [deadline, setDeadline] = useState("");
    const [price, setPrice] = useState("");
    const [currencyId, setCurrencyId] = useState<number | null>(null);
    const [autoMatch, setAutoMatch] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Загрузка специализаций
    useEffect(() => {
        request<SpecializationOption[] | { results?: SpecializationOption[] }>("/specializations/")
            .then((data) => {
                // Обрабатываем случай, когда API возвращает объект с results
                const list = Array.isArray(data) ? data : (data as { results?: SpecializationOption[] }).results ?? [];
                setSpecializations(list);
            })
            .catch(() => setSpecializations([]));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!topic.trim()) {
            setError("Укажите название проекта");
            return;
        }
        if (!languageFrom) {
            setError("Выберите язык исходника");
            return;
        }
        if (!languageTo) {
            setError("Выберите язык перевода");
            return;
        }
        if (languageFrom.id === languageTo.id) {
            setError("Языки должны отличаться");
            return;
        }
        if (!deadline) {
            setError("Укажите срок выполнения");
            return;
        }

        const deadlineDate = new Date(deadline);
        if (deadlineDate <= new Date()) {
            setError("Срок выполнения должен быть в будущем");
            return;
        }

        setIsSubmitting(true);

        try {
            const data: any = {
                topic: topic.trim(),
                language_from: languageFrom.id,
                language_to: languageTo.id,
                deadline_dt: deadlineDate.toISOString(),
                auto_match: autoMatch,
            };

            if (price && !Number.isNaN(Number(price))) {
                data.price = Number(price);
            }
            if (currencyId) {
                data.currency = currencyId;
            }
            if (selectedSpecializations.length > 0) {
                data.specializations = selectedSpecializations.map((s) => s.id);
            }

            const order = await request<OrderDTO>("/orders/", {
                method: "POST",
                json: data,
            });

            if (!order?.id) {
                throw new Error("Не удалось создать заказ: отсутствует ID в ответе сервера");
            }

            // Публикуем заказ
            await request(`/orders/${order.id}/publish/`, {
                method: "POST",
            });

            navigate("/orders");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось создать заказ");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
            <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Stack spacing={3}>
                    <Typography variant="h4" fontWeight={700}>
                        Разместить заказ
                    </Typography>

                    {error && <Alert severity="error">{error}</Alert>}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}
                    >
                        <TextField
                            label="Название проекта"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                            fullWidth
                            sx={{ gridColumn: { md: "1 / span 2" } }}
                        />
                        <Autocomplete
                            options={languages}
                            getOptionLabel={(option) => option.name}
                            value={languageFrom}
                            onChange={(_, value) => setLanguageFrom(value)}
                            renderInput={(params) => (
                                <TextField {...params} label="Язык исходника" required />
                            )}
                            fullWidth
                        />
                        <Autocomplete
                            options={languages}
                            getOptionLabel={(option) => option.name}
                            value={languageTo}
                            onChange={(_, value) => setLanguageTo(value)}
                            renderInput={(params) => (
                                <TextField {...params} label="Язык перевода" required />
                            )}
                            fullWidth
                        />
                        <Autocomplete
                            multiple
                            options={specializations}
                            getOptionLabel={(option) => option.title}
                            value={selectedSpecializations}
                            onChange={(_, value) => setSelectedSpecializations(value)}
                            renderInput={(params) => (
                                <TextField {...params} label="Специализации" />
                            )}
                            fullWidth
                            sx={{ gridColumn: { md: "1 / span 2" } }}
                        />
                        <TextField
                            label="Бюджет"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Валюта"
                            select
                            value={currencyId ?? ""}
                            onChange={(e) => setCurrencyId(e.target.value ? Number(e.target.value) : null)}
                            fullWidth
                        >
                            <MenuItem value="">Не указана</MenuItem>
                            {currencies.map((currency) => (
                                <MenuItem key={currency.id} value={currency.id}>
                                    {currency.code} ({currency.name})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Срок выполнения"
                            type="datetime-local"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                            fullWidth
                            sx={{ gridColumn: { md: "1 / span 2" } }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={autoMatch}
                                    onChange={(e) => setAutoMatch(e.target.checked)}
                                />
                            }
                            label="Автоматический подбор переводчика"
                            sx={{ gridColumn: { md: "1 / span 2" } }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{ gridColumn: { md: "1 / span 2" }, justifySelf: "start" }}
                        >
                            {isSubmitting ? "Создание..." : "Опубликовать заказ"}
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
}
