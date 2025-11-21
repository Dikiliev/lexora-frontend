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

function formatRate(value: number | null, currency: string | { code: string } | null): string {
    if (value === null) return "по запросу";
    const currencyCode = typeof currency === "string" ? currency : currency?.code ?? "USD";

    try {
        const formatted = new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: currencyCode,
            maximumFractionDigits: 0,
        }).format(value);
        return `${formatted}/ч`;
    } catch {
        const fallback = new Intl.NumberFormat("ru-RU").format(value);
        return `${fallback} ${currencyCode}/ч`;
    }
}

function getLanguagePairs(languages: TranslatorListItem["languages"]): string[] {
    if (!languages?.length) return [];
    return languages
        .map((pair) => {
            if (!pair.language_from && !pair.language_to) return null;
            return `${pair.language_from?.name ?? "—"} → ${pair.language_to?.name ?? "—"}`;
        })
        .filter((x): x is string => Boolean(x));
}

function formatCompletedOrders(count: number): string {
    if (!count) return "Нет завершённых заказов";

    const tail = count % 10;
    const teen = count % 100;
    let suffix = "заказов";

    if (tail === 1 && teen !== 11) suffix = "заказ";
    else if (tail >= 2 && tail <= 4 && (teen < 10 || teen >= 20)) suffix = "заказа";

    return `${count} ${suffix}`;
}

const VISIBLE_LANGUAGE_PAIRS_COUNT = 3;
const VISIBLE_SPECS_COUNT = 5;

export default function TranslatorCard({ translator }: TranslatorCardProps) {
    const languagePairs = getLanguagePairs(translator.languages);
    const visiblePairs = languagePairs.slice(0, VISIBLE_LANGUAGE_PAIRS_COUNT);
    const remainingPairs = Math.max(0, languagePairs.length - visiblePairs.length);

    const rating = translator.rating ?? 0;
    const hasRating = rating > 0;

    const rateLabel = formatRate(translator.hourlyRate, translator.currency);

    const specializations = translator.specializations ?? [];
    const visibleSpecs = specializations.slice(0, VISIBLE_SPECS_COUNT);
    const remainingSpecs = Math.max(0, specializations.length - visibleSpecs.length);

    return (
        <Card
            sx={{
                height: "100%",
                overflow: "hidden",
            }}
        >
            <CardActionArea
                component={RouterLink}
                to={`/translator/${translator.id}`}
                sx={{
                    display: "block",
                    textDecoration: "none",
                    borderRadius: "inherit",
                    height: "100%",
                }}
            >
                <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        {/* Аватар */}
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                bgcolor: "primary.main",
                                color: "primary.contrastText",
                                flexShrink: 0,
                            }}
                        >
                            <TranslateRoundedIcon />
                        </Avatar>

                        {/* Основной контент */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            {/* Имя */}
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    wordBreak: "break-word",
                                }}
                            >
                                {translator.fullName}
                            </Typography>

                            {/* Языковые пары */}
                            {visiblePairs.length > 0 && (
                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    alignItems="center"
                                    sx={{ mt: 0.75, flexWrap: "wrap" }}
                                >
                                    {visiblePairs.map((pair) => (
                                        <Chip
                                            key={pair}
                                            size="small"
                                            variant="outlined"
                                            label={pair}
                                            sx={{ borderRadius: 999 }}
                                        />
                                    ))}
                                    {remainingPairs > 0 && (
                                        <Chip
                                            size="small"
                                            label={`+ ещё ${remainingPairs}`}
                                            variant="outlined"
                                            sx={{ borderRadius: 999 }}
                                        />
                                    )}
                                </Stack>
                            )}

                            {/* Рейтинг + заказы */}
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mt: 1 }}
                            >
                                <Rating
                                    size="small"
                                    value={rating}
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
                                <Typography variant="caption" color="text.secondary">
                                    {hasRating ? rating.toFixed(1) : "Нет оценок"}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mx: 0.5 }}
                                >
                                    •
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatCompletedOrders(translator.completedOrders)}
                                </Typography>
                            </Stack>

                            {/* Специализации */}
                            {visibleSpecs.length > 0 && (
                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    sx={{ mt: 1, flexWrap: "wrap" }}
                                >
                                    {visibleSpecs.map((spec) => (
                                        <Chip
                                            key={spec.id}
                                            size="small"
                                            label={spec.title}
                                            sx={{ borderRadius: 999 }}
                                        />
                                    ))}
                                    {remainingSpecs > 0 && (
                                        <Chip
                                            size="small"
                                            label={`+ ещё ${remainingSpecs}`}
                                            variant="outlined"
                                            sx={{ borderRadius: 999 }}
                                        />
                                    )}
                                </Stack>
                            )}
                        </Box>

                        {/* Ставка */}
                        <Stack
                            alignItems="flex-end"
                            spacing={0.5}
                            sx={{ pl: 1, minWidth: 110, flexShrink: 0 }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    textTransform: "uppercase",
                                    letterSpacing: 0.4,
                                }}
                            >
                                Ставка
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700 }}
                                noWrap
                            >
                                {rateLabel}
                            </Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
