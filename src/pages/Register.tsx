import { useState } from "react";
import type { FormEvent } from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    FormControlLabel,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
    Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

type RoleOption = "client" | "translator";

export default function Register() {
    const register = useAuthStore((auth) => auth.register);
    const isLoading = useAuthStore((auth) => auth.isLoading);
    const error = useAuthStore((auth) => auth.error);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState<RoleOption>("client");
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        setSuccess(null);
        setFieldErrors({});

        if (password !== confirmPassword) {
            setFormError("Пароли не совпадают");
            return;
        }

        const first = firstName.trim();
        const last = lastName.trim();

        if (!first || !last) {
            setFormError("Заполните имя и фамилию");
            return;
        }

        try {
            await register({
                email,
                password,
                role,
                firstName: first,
                lastName: last,
            });
            setSuccess("Регистрация прошла успешно! Проверьте вашу почту и подтвердите email адрес.");
            // Не перенаправляем сразу, показываем сообщение
        } catch (err) {
            // Извлекаем детали ошибок из ответа
            if (err instanceof Error) {
                const errorWithData = err as Error & { data?: { details?: Record<string, unknown> } };
                if (errorWithData.data?.details) {
                    const details = errorWithData.data.details;
                    const fieldErrs: Record<string, string> = {};
                    
                    for (const [field, value] of Object.entries(details)) {
                        if (Array.isArray(value) && value.length > 0) {
                            fieldErrs[field] = String(value[0]);
                        } else if (typeof value === "string") {
                            fieldErrs[field] = value;
                        }
                    }
                    
                    if (Object.keys(fieldErrs).length > 0) {
                        setFieldErrors(fieldErrs);
                    }
                }
            }
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            Регистрация
                        </Typography>
                        <Typography color="text.secondary">Создайте аккаунт клиента или переводчика на платформе Lexora.</Typography>
                    </Box>

                    {formError && <Alert severity="error">{formError}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                label="Имя"
                                value={firstName}
                                onChange={(event) => {
                                    setFirstName(event.target.value);
                                    if (fieldErrors.first_name) {
                                        setFieldErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.first_name;
                                            return next;
                                        });
                                    }
                                }}
                                fullWidth
                                required
                                error={!!fieldErrors.first_name}
                                helperText={fieldErrors.first_name}
                            />
                            <TextField
                                label="Фамилия"
                                value={lastName}
                                onChange={(event) => {
                                    setLastName(event.target.value);
                                    if (fieldErrors.last_name) {
                                        setFieldErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.last_name;
                                            return next;
                                        });
                                    }
                                }}
                                fullWidth
                                required
                                error={!!fieldErrors.last_name}
                                helperText={fieldErrors.last_name}
                            />
                        </Stack>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                if (fieldErrors.email) {
                                    setFieldErrors((prev) => {
                                        const next = { ...prev };
                                        delete next.email;
                                        return next;
                                    });
                                }
                            }}
                            required
                            error={!!fieldErrors.email}
                            helperText={fieldErrors.email}
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                if (fieldErrors.password) {
                                    setFieldErrors((prev) => {
                                        const next = { ...prev };
                                        delete next.password;
                                        return next;
                                    });
                                }
                            }}
                            required
                            helperText={fieldErrors.password || "Не менее 8 символов"}
                            error={!!fieldErrors.password}
                        />
                        <TextField
                            label="Повторите пароль"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />
                        <FormControl component="fieldset" error={!!fieldErrors.role}>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                Тип аккаунта
                            </Typography>
                            <RadioGroup
                                row
                                value={role}
                                onChange={(event) => {
                                    setRole(event.target.value as RoleOption);
                                    if (fieldErrors.role) {
                                        setFieldErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.role;
                                            return next;
                                        });
                                    }
                                }}
                                name="role"
                            >
                                <FormControlLabel value="client" control={<Radio />} label="Клиент" />
                                <FormControlLabel value="translator" control={<Radio />} label="Переводчик" />
                            </RadioGroup>
                            {fieldErrors.role && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                    {fieldErrors.role}
                                </Typography>
                            )}
                        </FormControl>

                        <Button type="submit" variant="contained" size="large" disabled={isLoading}>
                            {isLoading ? "Создаем аккаунт..." : "Зарегистрироваться"}
                        </Button>
                    </Box>

                    <Typography color="text.secondary">
                        Уже есть аккаунт?{" "}
                        <Link component={RouterLink} to="/login">
                            Войдите
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );
}

