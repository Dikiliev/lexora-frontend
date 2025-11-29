import {
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Typography,
} from "@mui/material";
import { BasicsSection } from "./client-settings/components/BasicsSection";
import { NotificationsSection } from "./client-settings/components/NotificationsSection";
import { Feedback } from "./client-settings/components/Feedback";
import { useClientSettingsForm } from "./client-settings/useClientSettingsForm";

export default function ClientSettings() {
    const {
        state: {
            profile,
            isLoading,
            isSaving,
            error,
            success,
        },
        handlers: {
            submit,
            updateProfileField,
        },
    } = useClientSettingsForm();

    if (isLoading && !profile) {
        return (
            <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="50vh"
                >
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (!profile) {
        return (
            <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
                <Typography color="error" align="center">
                    {error ?? "Профиль не найден"}
                </Typography>
            </Container>
        );
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        void submit();
    };

    return (
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
            <Paper
                component="form"
                elevation={0}
                onSubmit={handleSubmit}
                sx={{
                    p: { xs: 2.5, md: 3.5 },
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    boxShadow: "0 18px 40px rgba(15,23,42,.06)",
                    borderColor: "divider",
                }}
            >
                {/* Заголовок */}
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        Настройки профиля заказчика
                    </Typography>
                    <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ mt: 0.75, maxWidth: 640 }}
                    >
                        Заполните информацию о себе, чтобы переводчики могли
                        лучше понять ваши потребности.
                    </Typography>
                </Box>

                {/* Общий фидбек */}
                <Feedback error={error} success={success} />

                {/* Базовая информация */}
                <BasicsSection
                    profile={profile}
                    onFieldChange={updateProfileField}
                />

                <Divider />

                {/* Уведомления */}
                <NotificationsSection
                    profile={profile}
                    onFieldChange={updateProfileField}
                />

                {/* Кнопка сохранения */}
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    sx={{ pt: 1 }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        type="submit"
                        disabled={isSaving}
                        startIcon={
                            isSaving ? (
                                <CircularProgress size={16} thickness={4} />
                            ) : null
                        }
                    >
                        {isSaving ? "Сохраняем..." : "Сохранить изменения"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

