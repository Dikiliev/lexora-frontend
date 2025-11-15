import { Stack, TextField, Typography, MenuItem } from "@mui/material";
import type { TranslatorProfileDTO } from "../types";
import { CURRENCY_OPTIONS } from "../constants";

interface BasicsSectionProps {
    profile: TranslatorProfileDTO;
    onFieldChange: <K extends keyof TranslatorProfileDTO>(field: K, value: TranslatorProfileDTO[K]) => void;
}

export function BasicsSection({ profile, onFieldChange }: BasicsSectionProps) {
    return (
        <Stack spacing={2}>
            <Typography variant="h6" fontWeight={700}>
                Основная информация
            </Typography>
            <TextField
                label="Полное имя"
                value={profile.full_name}
                onChange={(event) => onFieldChange("full_name", event.target.value)}
            />
            <TextField
                label="Опыт (лет)"
                type="number"
                value={profile.experience_years}
                onChange={(event) => onFieldChange("experience_years", Number(event.target.value ?? 0))}
            />
            <TextField
                label="Образование"
                value={profile.education}
                onChange={(event) => onFieldChange("education", event.target.value)}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                    label="Ставка (в час)"
                    type="number"
                    value={profile.hourly_rate}
                    onChange={(event) => onFieldChange("hourly_rate", event.target.value)}
                    fullWidth
                />
                <TextField
                    label="Валюта"
                    select
                    value={profile.currency}
                    onChange={(event) => onFieldChange("currency", event.target.value)}
                    fullWidth
                >
                    {CURRENCY_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>
            <TextField
                label="О себе"
                value={profile.bio}
                onChange={(event) => onFieldChange("bio", event.target.value)}
                multiline
                minRows={4}
            />
        </Stack>
    );
}

