import {
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Link as RouterLink } from "react-router-dom";
import type { OrderListItem } from "../pages/orders/useOrderSearch";

interface OrderCardProps {
    order: OrderListItem;
}

function formatPrice(value: number | null, currency: string | null): string {
    if (value === null) return "По договорённости";
    if (!currency) return `${value}`;
    
    try {
        const formatted = new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 0,
        }).format(value);
        return formatted;
    } catch {
        return `${value} ${currency}`;
    }
}

function formatDeadline(deadline: string): string {
    try {
        const date = new Date(deadline);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        if (days < 0) return "Просрочен";
        if (days === 0) return "Сегодня";
        if (days === 1) return "Завтра";
        if (days < 7) return `Через ${days} дн.`;
        if (days < 30) return `Через ${Math.ceil(days / 7)} нед.`;
        
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return deadline;
    }
}

function getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
        draft: "Черновик",
        published: "Опубликован",
        candidate_found: "Кандидат найден",
        in_progress: "В работе",
        review: "На проверке",
        done: "Завершён",
        canceled: "Отменён",
    };
    return statusMap[status] || status;
}

function getStatusColor(status: string): "default" | "primary" | "success" | "warning" | "error" | "info" {
    const colorMap: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
        draft: "default",
        published: "primary",
        candidate_found: "info",
        in_progress: "warning",
        review: "warning",
        done: "success",
        canceled: "error",
    };
    return colorMap[status] || "default";
}

const VISIBLE_SPECS_COUNT = 3;

export default function OrderCard({ order }: OrderCardProps) {
    const visibleSpecs = order.specializations.slice(0, VISIBLE_SPECS_COUNT);
    const remainingSpecs = Math.max(0, order.specializations.length - visibleSpecs.length);

    return (
        <Card
            sx={{
                height: "100%",
                overflow: "hidden",
            }}
        >
            <CardActionArea
                component={RouterLink}
                to={`/orders/${order.id}`}
                sx={{
                    display: "block",
                    textDecoration: "none",
                    borderRadius: "inherit",
                    height: "100%",
                }}
            >
                <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={2}>
                        {/* Заголовок и статус */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    wordBreak: "break-word",
                                    flex: 1,
                                }}
                            >
                                {order.topic}
                            </Typography>
                            <Chip
                                label={getStatusLabel(order.status)}
                                color={getStatusColor(order.status)}
                                size="small"
                                sx={{ flexShrink: 0 }}
                            />
                        </Stack>

                        {/* Языковая пара */}
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                            <Chip
                                size="small"
                                variant="outlined"
                                label={`${order.languageFrom.name} → ${order.languageTo.name}`}
                                sx={{ borderRadius: 999 }}
                            />
                        </Stack>

                        {/* Специализации */}
                        {visibleSpecs.length > 0 && (
                            <Stack direction="row" spacing={0.75} flexWrap="wrap">
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

                        {/* Дедлайн и цена */}
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <AccessTimeIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    {formatDeadline(order.deadline)}
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <AttachMoneyIcon fontSize="small" color="action" />
                                <Typography variant="body2" fontWeight={600}>
                                    {formatPrice(order.price, order.currency)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}



