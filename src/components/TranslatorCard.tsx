import {
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Rating,
    Stack,
    Typography,
} from "@mui/material";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { Link as RouterLink } from "react-router-dom";
import type { Translator } from "../types";

export default function TranslatorCard({ t }: { t: Translator }) {
    return (
        <Card sx={{ height: "100%" }}>
            <CardActionArea
                component={RouterLink as any}
                to={`/translator/${t.id}`}
                sx={{
                    display: "block",
                    textDecoration: "none",
                    borderRadius: "inherit",
                }}
            >
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={t.avatarUrl} sx={{ width: 56, height: 56 }}>
                            <TranslateRoundedIcon />
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="h6" noWrap>
                                    {t.name}
                                </Typography>
                                {t.verified && <VerifiedRoundedIcon color="primary" fontSize="small" />}
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    label={`${t.fromLang} → ${t.toLang}`}
                                    sx={{ borderRadius: 999 }}
                                />
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <Rating size="small" value={t.rating} precision={0.1} readOnly />
                                    <Typography variant="caption">{t.rating.toFixed(1)}</Typography>
                                </Stack>
                            </Stack>

                            <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: "wrap" }}>
                                {t.categories.slice(0, 3).map((c) => (
                                    <Chip key={c} size="small" label={c} />
                                ))}
                            </Stack>
                        </Box>

                        {/* правая колонка: ставка */}
                        <Stack alignItems="flex-end" spacing={0.5} sx={{ pl: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Ставка
                            </Typography>
                            <Typography variant="h6">₽{t.rate}/ч</Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
