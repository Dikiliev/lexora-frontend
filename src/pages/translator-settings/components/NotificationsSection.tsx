import { Stack, Switch, Typography } from "@mui/material";
import type { TranslatorProfileDTO } from "../types";

interface NotificationsSectionProps {
    profile: TranslatorProfileDTO;
    onFieldChange: <K extends keyof TranslatorProfileDTO>(field: K, value: TranslatorProfileDTO[K]) => void;
}

export function NotificationsSection({ profile, onFieldChange }: NotificationsSectionProps) {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Уведомления по email</Typography>
            <Switch
                checked={profile.email_enabled}
                onChange={(event) => onFieldChange("email_enabled", event.target.checked)}
            />
            <Typography>push</Typography>
            <Switch
                checked={profile.push_enabled}
                onChange={(event) => onFieldChange("push_enabled", event.target.checked)}
            />
        </Stack>
    );
}

