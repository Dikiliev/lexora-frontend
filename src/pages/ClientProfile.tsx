import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { API_URL, request } from "../utils/api";
import { useAuthStore } from "../stores/authStore";

interface ClientProfileDTO {
    first_name: string;
    last_name: string;
    company_name: string;
    phone: string | null;
    avatar: string | null;
    contacts: Record<string, unknown>;
    order_count: number;
}

// Функция для получения полного URL аватара
function getAvatarUrl(avatar: string | null | undefined): string | undefined {
    if (!avatar) return undefined;
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
        return avatar;
    }
    const baseUrl = API_URL.replace("/api/v1", "");
    return `${baseUrl}${avatar}`;
}

// Функция для получения инициалов
function getInitials(firstName: string | null | undefined, lastName: string | null | undefined): string {
    const first = firstName?.[0]?.toUpperCase() ?? "";
    const last = lastName?.[0]?.toUpperCase() ?? "";
    return first + last || "?";
}

export default function ClientProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [profile, setProfile] = useState<ClientProfileDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID клиента не указан");
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setError(null);

        request<ClientProfileDTO>(`/clients/${id}/`)
            .then((data) => {
                if (!isMounted) return;
                setProfile(data);
            })
            .catch((err) => {
                if (!isMounted) return;
                const message = err instanceof Error ? err.message : "Не удалось загрузить профиль";
                setError(message);
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [id]);

    const isOwnProfile = user?.id === Number(id);
    const avatarUrl = profile?.avatar ? getAvatarUrl(profile.avatar) : undefined;
    const initials = getInitials(profile?.first_name, profile?.last_name);
    const fullName = profile
        ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Клиент"
        : "";

    if (isLoading) {
        return (
            <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !profile) {
        return (
            <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
                <Paper sx={{ p: 3, textAlign: "center" }}>
                    <Typography color="error" variant="h6" gutterBottom>
                        {error ?? "Профиль не найден"}
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                        Назад
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, md: 3.5 },
                    boxShadow: "0 18px 40px rgba(15,23,42,.06)",
                    borderColor: "divider",
                }}
            >
                <Stack spacing={3}>
                    {/* Заголовок */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            src={avatarUrl}
                            sx={{ width: 80, height: 80, fontSize: 32 }}
                        >
                            {initials}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" fontWeight={800}>
                                {fullName}
                            </Typography>
                            {profile.company_name && (
                                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {profile.company_name}
                                </Typography>
                            )}
                        </Box>
                        {isOwnProfile && (
                            <Button
                                variant="outlined"
                                onClick={() => navigate("/client/settings")}
                            >
                                Редактировать
                            </Button>
                        )}
                    </Stack>

                    {/* Информация */}
                    <Stack spacing={2}>
                        {profile.phone && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Телефон
                                </Typography>
                                <Typography variant="body1">{profile.phone}</Typography>
                            </Box>
                        )}

                        {profile.order_count > 0 && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Завершено заказов
                                </Typography>
                                <Typography variant="body1">{profile.order_count}</Typography>
                            </Box>
                        )}
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
}

