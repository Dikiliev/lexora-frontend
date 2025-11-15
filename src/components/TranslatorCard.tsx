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
import { Link as RouterLink } from "react-router-dom";
import type { TranslatorListItem } from "../pages/search/useTranslatorSearch";

interface TranslatorCardProps {
    translator: TranslatorListItem;
}

function formatRate(value: number | null, currency: string): string {
    if (value === null) return "—";
    const formatted = Intl.NumberFormat("ru-RU").format(value);
    return `${formatted} ${currency}/ч`;
}

function getPrimaryPair(languages: TranslatorListItem["languages"]): string | null {
    if (!languages?.length) return null;
    const pair = languages[0];
    if (!pair.language_from && !pair.language_to) return null;
    return `${pair.language_from ?? "—"} → ${pair.language_to ?? "—"}`;
}

export default function TranslatorCard({ translator }: TranslatorCardProps) {
    const pairLabel = getPrimaryPair(translator.languages);
    const rating = translator.rating ?? 0;
    const rateLabel = formatRate(translator.hourlyRate, translator.currency);

    return (
        <Card sx={{ height: "100%" }}>
            <CardActionArea
                component={RouterLink as any}
                to={`/translator/${translator.id}`}
                sx={{
                    display: "block",
                    textDecoration: "none",
                    borderRadius: "inherit",
                }}
            >
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 56, height: 56 }}>
                            <TranslateRoundedIcon />
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" noWrap>
                                {translator.fullName}
                            </Typography>

                            {pairLabel && (
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    label={pairLabel}
                                    sx={{ mt: 0.5, borderRadius: 999 }}
                                />
                            )}

                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                                <Rating size="small" value={rating} precision={0.1} readOnly />
                                <Typography variant="caption">{rating.toFixed(1)}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    • Выполнено {translator.completedOrders}
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: "wrap" }}>
                                {translator.specializations.slice(0, 3).map((spec) => (
                                    <Chip key={spec.id} size="small" label={spec.title} />
                                ))}
                            </Stack>
                        </Box>

                        <Stack alignItems="flex-end" spacing={0.5} sx={{ pl: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Ставка
                            </Typography>
                            <Typography variant="h6" noWrap>
                                {rateLabel}
                            </Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
