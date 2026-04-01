import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import { useAuthStore } from "../../stores/authStore";
import { request } from "../../utils/api";
import type { OrderBidDTO } from "./BidForm";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import MessageRoundedIcon from "@mui/icons-material/MessageRounded";

interface BidsListProps {
    orderId: number;
    onBidAccepted?: () => void;
}

function formatPrice(value: string | number): string {
    const numValue = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(numValue)) return String(value);

    try {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(numValue);
    } catch {
        return String(numValue);
    }
}

function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch {
        return dateString;
    }
}

function getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
        pending: "Ожидает",
        accepted: "Принят",
        declined: "Отклонён",
    };
    return statusMap[status] || status;
}

function getStatusIcon(status: string) {
    switch (status) {
        case "accepted":
            return <CheckCircleRoundedIcon color="success" />;
        case "declined":
            return <CancelRoundedIcon color="error" />;
        default:
            return <HourglassEmptyRoundedIcon color="action" />;
    }
}

export default function BidsList({ orderId, onBidAccepted }: BidsListProps) {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const [bids, setBids] = useState<OrderBidDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contactingBidId, setContactingBidId] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        request<OrderBidDTO[]>(`/orders/${orderId}/bids/`)
            .then((data) => {
                if (isMounted) {
                    setBids(data);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Не удалось загрузить отклики");
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [orderId]);

    const handleAcceptBid = async (bidId: number) => {
        if (!confirm("Вы уверены, что хотите принять этот отклик?")) {
            return;
        }

        try {
            await request(`/orders/${orderId}/bids/${bidId}/accept/`, {
                method: "POST",
            });

            // Перезагружаем список откликов
            const data = await request<OrderBidDTO[]>(`/orders/${orderId}/bids/`);
            setBids(data);
            onBidAccepted?.();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Не удалось принять отклик");
        }
    };

    const handleContactTranslator = async (bidId: number) => {
        setContactingBidId(bidId);
        try {
            const response = await request<{ thread: { id: number }; chat_order: { id: number } }>(
                `/orders/${orderId}/bids/${bidId}/contact/`,
                {
                    method: "POST",
                }
            );

            // Переходим в чат
            const chatPath = user?.role === "client" ? "/chats" : "/translator/chats";
            navigate(`${chatPath}?thread=${response.thread.id}`);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Не удалось открыть чат");
        } finally {
            setContactingBidId(null);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (bids.length === 0) {
        return (
            <Alert severity="info">Пока нет откликов на этот заказ.</Alert>
        );
    }

    return (
        <Stack spacing={2}>
            {bids.map((bid) => (
                <Card key={bid.id}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {getStatusIcon(bid.status)}
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {getStatusLabel(bid.status)}
                                    </Typography>
                                </Stack>
                                {bid.status === "pending" && user?.role === "client" && (
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            startIcon={<MessageRoundedIcon />}
                                            onClick={() => handleContactTranslator(bid.id)}
                                            disabled={contactingBidId === bid.id}
                                        >
                                            {contactingBidId === bid.id ? "Открытие..." : "Рассмотреть"}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => handleAcceptBid(bid.id)}
                                        >
                                            Принять
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>

                            <Stack spacing={1}>
                                {/* Информация о переводчике */}
                                {bid.translator_name && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body1" fontWeight={600}>
                                            Переводчик:{" "}
                                            <Box
                                                component={RouterLink}
                                                to={`/translator/${bid.translator}`}
                                                sx={{
                                                    color: "primary.main",
                                                    textDecoration: "none",
                                                    "&:hover": { textDecoration: "underline" },
                                                }}
                                            >
                                                {bid.translator_name}
                                            </Box>
                                        </Typography>
                                        {bid.translator_rating && bid.translator_rating > 0 && (
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <StarRoundedIcon fontSize="small" sx={{ color: "warning.main" }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {bid.translator_rating.toFixed(1)}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Stack>
                                )}

                                <Typography variant="body1" fontWeight={600}>
                                    Предложенная цена: {formatPrice(bid.proposed_price)}
                                </Typography>
                                {bid.comment && (
                                    <Typography variant="body2" color="text.secondary">
                                        {bid.comment}
                                    </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                    Отправлено: {formatDate(bid.created_at)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
}

