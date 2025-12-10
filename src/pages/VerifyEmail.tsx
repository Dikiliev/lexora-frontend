import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Alert,
    Button,
    Container,
    Paper,
    Stack,
    Typography,
    Link,
    CircularProgress,
} from "@mui/material";
import { request } from "../utils/api";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const verify = async () => {
            const uid = searchParams.get("uid");
            const token = searchParams.get("token");

            if (!uid || !token) {
                setStatus("error");
                setMessage("Неверная ссылка подтверждения. Отсутствуют необходимые параметры.");
                return;
            }

            try {
                const response = await request<{ ok: boolean; email_verified: boolean; message?: string }>(
                    "/auth/verify-email",
                    {
                        method: "POST",
                        json: { uid, token },
                    }
                );

                if (response.ok || response.email_verified) {
                    setStatus("success");
                    setMessage(response.message || "Email успешно подтвержден! Теперь вы можете войти в систему.");
                } else {
                    setStatus("error");
                    setMessage("Не удалось подтвердить email. Пожалуйста, попробуйте еще раз.");
                }
            } catch (error) {
                setStatus("error");
                if (error instanceof Error) {
                    setMessage(error.message);
                } else {
                    setMessage("Произошла ошибка при подтверждении email. Пожалуйста, попробуйте еще раз.");
                }
            }
        };

        verify();
    }, [searchParams]);

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
                <Stack spacing={3} alignItems="center">
                    {status === "loading" && (
                        <>
                            <CircularProgress />
                            <Typography variant="h6">Подтверждение email...</Typography>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <Alert severity="success" sx={{ width: "100%" }}>
                                {message}
                            </Alert>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate("/login")}
                                fullWidth
                            >
                                Войти в систему
                            </Button>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <Alert severity="error" sx={{ width: "100%" }}>
                                {message}
                            </Alert>
                            <Stack spacing={2} width="100%">
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate("/resend-verification")}
                                    fullWidth
                                >
                                    Отправить письмо повторно
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate("/login")}
                                    fullWidth
                                >
                                    Перейти на страницу входа
                                </Button>
                            </Stack>
                        </>
                    )}

                    <Typography color="text.secondary" textAlign="center">
                        <Link component={RouterLink} to="/">
                            Вернуться на главную
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );
}

