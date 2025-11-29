import { Stack, Switch, Typography } from "@mui/material";
import type { ClientProfileDTO } from "../types";

interface NotificationsSectionProps {
    profile: ClientProfileDTO;
    onFieldChange: <K extends keyof ClientProfileDTO>(field: K, value: ClientProfileDTO[K]) => void;
}

export function NotificationsSection({
    profile,
    onFieldChange,
}: NotificationsSectionProps) {
    return (
        <Stack spacing={1.5}>
            <Stack spacing={0.5}>
                <Typography variant="h6" fontWeight={700}>
                    Уведомления
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Выберите, каким способом получать уведомления о новых
                    сообщениях и заказах.
                </Typography>
            </Stack>

            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
            >
                <Stack spacing={0.25}>
                    <Typography variant="body2">
                        Уведомления по email
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Письма о новых сообщениях и статусе заказов.
                    </Typography>
                </Stack>
                <Switch
                    checked={profile.email_enabled}
                    onChange={(event) =>
                        onFieldChange("email_enabled", event.target.checked)
                    }
                />
            </Stack>

            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
            >
                <Stack spacing={0.25}>
                    <Typography variant="body2">
                        Push-уведомления
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Быстрые уведомления в браузере или приложении.
                    </Typography>
                </Stack>
                <Switch
                    checked={profile.push_enabled}
                    onChange={(event) =>
                        onFieldChange("push_enabled", event.target.checked)
                    }
                />
            </Stack>
        </Stack>
    );
}

