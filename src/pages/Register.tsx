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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

type RoleOption = "client" | "translator";

export default function Register() {
    const navigate = useNavigate();
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        setSuccess(null);

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
            setSuccess("Регистрация прошла успешно! Вы можете войти, используя свои данные.");
            navigate("/login", { state: { registered: true, email } });
        } catch {
            // ошибка уже сохранена в сторе
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
                                onChange={(event) => setFirstName(event.target.value)}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Фамилия"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                fullWidth
                                required
                            />
                        </Stack>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            helperText="Не менее 8 символов"
                        />
                        <TextField
                            label="Повторите пароль"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />
                        <FormControl component="fieldset">
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                Тип аккаунта
                            </Typography>
                            <RadioGroup
                                row
                                value={role}
                                onChange={(event) => setRole(event.target.value as RoleOption)}
                                name="role"
                            >
                                <FormControlLabel value="client" control={<Radio />} label="Клиент" />
                                <FormControlLabel value="translator" control={<Radio />} label="Переводчик" />
                            </RadioGroup>
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

