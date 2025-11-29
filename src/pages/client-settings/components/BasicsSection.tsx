import { Avatar, Box, Button, Stack, TextField, Typography } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import { API_URL } from "../../../utils/api";
import type { ClientProfileDTO } from "../types";

// Функция для получения полного URL аватара
function getAvatarUrl(avatar: string | File | null | undefined): string | undefined {
    if (!avatar) return undefined;
    if (avatar instanceof File) {
        return URL.createObjectURL(avatar);
    }
    if (typeof avatar === "string") {
        // Если это полный URL, возвращаем как есть
        if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
            return avatar;
        }
        // Если это относительный путь, добавляем базовый URL бекенда
        const baseUrl = API_URL.replace("/api/v1", "");
        return `${baseUrl}${avatar}`;
    }
    return undefined;
}

interface BasicsSectionProps {
    profile: ClientProfileDTO;
    onFieldChange: <K extends keyof ClientProfileDTO>(field: K, value: ClientProfileDTO[K]) => void;
}

export function BasicsSection({ profile, onFieldChange }: BasicsSectionProps) {
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFieldChange("avatar", file);
        }
    };

    return (
        <Stack spacing={2.25}>
            <Stack spacing={0.5}>
                <Typography variant="h6" fontWeight={700}>
                    Основная информация
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Это то, что видят переводчики в вашем профиле.
                </Typography>
            </Stack>

            {/* Аватар */}
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                    src={getAvatarUrl(profile.avatar)}
                    sx={{ width: 80, height: 80 }}
                >
                    {profile.first_name?.[0] ?? profile.last_name?.[0] ?? "?"}
                </Avatar>
                <Box>
                    <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="avatar-upload"
                        type="file"
                        onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload">
                        <Button
                            component="span"
                            variant="outlined"
                            size="small"
                            startIcon={<PhotoCameraRoundedIcon />}
                        >
                            Изменить фото
                        </Button>
                    </label>
                </Box>
            </Stack>

            {/* Имя и фамилия */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
            >
                <TextField
                    label="Имя"
                    value={profile.first_name ?? ""}
                    onChange={(event) =>
                        onFieldChange("first_name", event.target.value)
                    }
                    fullWidth
                />
                <TextField
                    label="Фамилия"
                    value={profile.last_name ?? ""}
                    onChange={(event) =>
                        onFieldChange("last_name", event.target.value)
                    }
                    fullWidth
                />
            </Stack>

            {/* Название компании */}
            <TextField
                label="Название компании"
                value={profile.company_name ?? ""}
                onChange={(event) =>
                    onFieldChange("company_name", event.target.value)
                }
                fullWidth
            />

            {/* Телефон */}
            <TextField
                label="Телефон"
                value={profile.phone ?? ""}
                onChange={(event) =>
                    onFieldChange("phone", event.target.value || null)
                }
                fullWidth
                type="tel"
            />
        </Stack>
    );
}

