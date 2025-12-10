import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Box, Button, Container, Link, Paper, Stack, TextField, Typography, Alert } from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface LocationState {
    from?: string;
    registered?: boolean;
    email?: string;
}

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as LocationState) || {};

    const [email, setEmail] = useState(state.email ?? "");
    const [password, setPassword] = useState("");
    const [successMessage, setSuccessMessage] = useState<string | null>(
        state.registered ? "Регистрация прошла успешно! Проверьте вашу почту и подтвердите email адрес." : null
    );
    const [emailNotVerified, setEmailNotVerified] = useState(false);

    const login = useAuthStore((auth) => auth.login);
    const isLoading = useAuthStore((auth) => auth.isLoading);
    const error = useAuthStore((auth) => auth.error);

    const redirectPath = useMemo(() => state.from ?? "/", [state.from]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setEmailNotVerified(false);
        setSuccessMessage(null);
        try {
            await login(email, password);
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setSuccessMessage(null);
            // Проверяем, содержит ли ошибка информацию о неподтвержденном email
            if (err instanceof Error && err.message.includes("Email не подтвержден")) {
                setEmailNotVerified(true);
            }
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            Вход в аккаунт
                        </Typography>
                        <Typography color="text.secondary">
                            Введите ваш email и пароль, чтобы продолжить работу с платформой.
                        </Typography>
                    </Box>

                    {successMessage && <Alert severity="success">{successMessage}</Alert>}
                    {error && !emailNotVerified && <Alert severity="error">{error}</Alert>}
                    {emailNotVerified && (
                        <Alert
                            severity="warning"
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    component={RouterLink}
                                    to={`/resend-verification?email=${encodeURIComponent(email)}`}
                                >
                                    Отправить письмо
                                </Button>
                            }
                        >
                            Email не подтвержден. Пожалуйста, проверьте вашу почту и подтвердите email адрес.
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            autoComplete="email"
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            autoComplete="current-password"
                        />
                        <Button type="submit" variant="contained" size="large" disabled={isLoading}>
                            {isLoading ? "Входим..." : "Войти"}
                        </Button>
                    </Box>

                    <Typography color="text.secondary">
                        Еще нет аккаунта?{" "}
                        <Link component={RouterLink} to="/register">
                            Зарегистрируйтесь
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );
}

