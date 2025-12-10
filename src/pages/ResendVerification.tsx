import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
    Link,
} from "@mui/material";
import { request } from "../utils/api";

export default function ResendVerification() {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const response = await request<{ ok: boolean; message?: string }>("/auth/resend-verification", {
                method: "POST",
                json: { email },
            });

            setStatus("success");
            setMessage(
                response.message ||
                    "Если пользователь с таким email существует и email не подтвержден, письмо отправлено."
            );
        } catch (error) {
            setStatus("error");
            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
            }
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            Повторная отправка письма подтверждения
                        </Typography>
                        <Typography color="text.secondary">
                            Введите ваш email адрес, и мы отправим вам новое письмо с подтверждением.
                        </Typography>
                    </Box>

                    {status === "success" && <Alert severity="success">{message}</Alert>}
                    {status === "error" && <Alert severity="error">{message}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            disabled={status === "loading"}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={status === "loading"}
                            fullWidth
                        >
                            {status === "loading" ? "Отправка..." : "Отправить письмо"}
                        </Button>
                    </Box>

                    <Typography color="text.secondary" textAlign="center">
                        <Link component={RouterLink} to="/login">
                            Вернуться на страницу входа
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );
}

