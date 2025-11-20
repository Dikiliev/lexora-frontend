import { Avatar, Box, Button, Divider, Paper, Rating, Stack, Typography } from "@mui/material";
import type { TranslatorProfileDTO } from "../../pages/translator-settings/types";

interface ProfileHeaderProps {
    profile: TranslatorProfileDTO;
    ratingValue: number;
    hourlyRateLabel: string;
    initials: string;
    chatButtonLabel: string;
    chatButtonDisabled: boolean;
    onOpenChat: () => void;
    chatHint?: string;
}

export function ProfileHeader({
    profile,
    ratingValue,
    hourlyRateLabel,
    initials,
    chatButtonLabel,
    chatButtonDisabled,
    onOpenChat,
    chatHint,
}: ProfileHeaderProps) {
    return (
        <Paper
            sx={{
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 3, md: 4 },
                alignItems: { xs: "flex-start", md: "center" },
            }}
        >
            <Avatar
                sx={{
                    width: 80,
                    height: 80,
                    fontSize: 30,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                }}
            >
                {initials}
            </Avatar>

            <Box flex={1}>
                <Stack spacing={1.5}>
                    <Typography variant="h4" fontWeight={800}>
                        {profile.full_name || "Без имени"}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        flexWrap="wrap"
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Rating
                                value={ratingValue}
                                precision={0.1}
                                readOnly
                                sx={{
                                    "& .MuiRating-iconFilled": {
                                        color: "primary.main",
                                    },
                                    "& .MuiRating-iconHover": {
                                        color: "primary.main",
                                    },
                                }}
                            />
                            <Typography color="text.secondary">
                                {ratingValue ? ratingValue.toFixed(1) : "—"}
                            </Typography>
                        </Stack>

                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                        <Typography color="text.secondary">
                            {hourlyRateLabel !== "—"
                                ? `Базовая ставка: ${hourlyRateLabel}`
                                : "Ставка не указана"}
                        </Typography>
                    </Stack>

                    {profile.bio && (
                        <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                            {profile.bio}
                        </Typography>
                    )}
                </Stack>
            </Box>

            <Box>
                <Button
                    variant="contained"
                    size="large"
                    disabled={chatButtonDisabled}
                    onClick={onOpenChat}
                    fullWidth
                >
                    {chatButtonLabel}
                </Button>
                {chatHint && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                    >
                        {chatHint}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}

