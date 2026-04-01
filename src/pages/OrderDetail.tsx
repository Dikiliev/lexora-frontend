import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useAuthStore } from "../stores/authStore";
import { request } from "../utils/api";
import BidForm from "../components/orders/BidForm";
import BidsList from "../components/orders/BidsList";

export interface OrderDetailDTO {
    id: number;
    topic: string;
    language_from: { id: number; code: string; name: string; native_name?: string };
    language_to: { id: number; code: string; name: string; native_name?: string };
    specializations: Array<{ id: number; slug: string; title: string }>;
    deadline_dt: string;
    status: string;
    price: string | null;
    currency: { id: number; code: string; name: string; symbol?: string } | null;
    auto_match: boolean;
    attachments: Array<{ id: number; file: string; original_name: string; size: number; created_at: string }>;
    created_at: string;
    updated_at: string;
    client: number;
    translator: number | null;
}

function formatPrice(value: string | number | null, currency: { code: string } | null): string {
    if (value === null) return "По договорённости";
    const numValue = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(numValue)) return "По договорённости";
    if (!currency) return `${numValue}`;

    try {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: currency.code,
            maximumFractionDigits: 0,
        }).format(numValue);
    } catch {
        return `${numValue} ${currency.code}`;
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

function getStatusColor(status: string): "default" | "primary" | "success" | "warning" | "error" {
    const colorMap: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
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

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const isTranslator = user?.role === "translator";
    const isClient = user?.role === "client";

    const [order, setOrder] = useState<OrderDetailDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bidsCount, setBidsCount] = useState(0);

    const isOwner = user?.id && order && order.client === user.id;

    useEffect(() => {
        if (!id) {
            setError("ID заказа не указан");
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setError(null);

        request<OrderDetailDTO>(`/orders/${id}/`)
            .then((data) => {
                if (isMounted) {
                    setOrder(data);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Не удалось загрузить заказ");
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
    }, [id]);

    const handleBidCreated = () => {
        // Перезагружаем заказ, чтобы обновить информацию
        if (id) {
            request<OrderDetailDTO>(`/orders/${id}/`)
                .then((data) => {
                    setOrder(data);
                })
                .catch(() => {
                    // Игнорируем ошибки при перезагрузке
                });
        }
        setBidsCount((prev) => prev + 1);
    };

    const handleBidAccepted = () => {
        // Перезагружаем заказ после принятия отклика
        if (id) {
            request<OrderDetailDTO>(`/orders/${id}/`)
                .then((data) => {
                    setOrder(data);
                })
                .catch(() => {
                    // Игнорируем ошибки при перезагрузке
                });
        }
    };

    if (isLoading) {
        return (
            <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !order) {
        return (
            <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
                <Alert severity="error">{error ?? "Заказ не найден"}</Alert>
                <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => navigate("/orders")}
                    sx={{ mt: 2 }}
                >
                    Вернуться к списку заказов
                </Button>
            </Container>
        );
    }

    const canBid = isTranslator && order.status === "published" && !order.translator;
    const canViewBids = isClient && (order.client === user?.id || isOwner);

    return (
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
                {/* Кнопка назад */}
                <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => navigate("/orders")}
                    sx={{ alignSelf: "flex-start" }}
                >
                    Назад к списку
                </Button>

                {/* Основная информация о заказе */}
                <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Stack spacing={3}>
                        {/* Заголовок и статус */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                            <Typography variant="h4" fontWeight={700} sx={{ flex: 1 }}>
                                {order.topic}
                            </Typography>
                            <Chip
                                label={getStatusLabel(order.status)}
                                color={getStatusColor(order.status)}
                                size="medium"
                            />
                        </Stack>

                        <Divider />

                        {/* Языковая пара */}
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TranslateRoundedIcon fontSize="small" color="action" />
                            <Typography variant="body1">
                                {order.language_from.name} → {order.language_to.name}
                            </Typography>
                        </Stack>

                        {/* Специализации */}
                        {order.specializations.length > 0 && (
                            <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                    Специализации:
                                </Typography>
                                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                                    {order.specializations.map((spec) => (
                                        <Chip key={spec.id} label={spec.title} size="small" />
                                    ))}
                                </Stack>
                            </Stack>
                        )}

                        {/* Дедлайн */}
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTimeRoundedIcon fontSize="small" color="action" />
                            <Typography variant="body1">
                                Срок выполнения: {formatDate(order.deadline_dt)}
                            </Typography>
                        </Stack>

                        {/* Бюджет */}
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AttachMoneyRoundedIcon fontSize="small" color="action" />
                            <Typography variant="body1" fontWeight={600}>
                                Бюджет: {formatPrice(order.price, order.currency)}
                            </Typography>
                        </Stack>

                        {/* Переводчик */}
                        {order.translator && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <WorkRoundedIcon fontSize="small" color="action" />
                                <Typography variant="body1">
                                    Переводчик назначен (ID: {order.translator})
                                </Typography>
                            </Stack>
                        )}

                        {/* Автоподбор */}
                        {order.auto_match && (
                            <Chip label="Автоматический подбор переводчика" size="small" color="info" />
                        )}

                        {/* Вложения */}
                        {order.attachments.length > 0 && (
                            <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                    Вложения:
                                </Typography>
                                <Stack spacing={0.5}>
                                    {order.attachments.map((attachment) => (
                                        <Button
                                            key={attachment.id}
                                            href={attachment.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            size="small"
                                            variant="outlined"
                                        >
                                            {attachment.original_name}
                                        </Button>
                                    ))}
                                </Stack>
                            </Stack>
                        )}

                        {/* Даты создания и обновления */}
                        <Stack spacing={0.5}>
                            <Typography variant="body2" color="text.secondary">
                                Создан: {formatDate(order.created_at)}
                            </Typography>
                            {order.updated_at !== order.created_at && (
                                <Typography variant="body2" color="text.secondary">
                                    Обновлён: {formatDate(order.updated_at)}
                                </Typography>
                            )}
                        </Stack>
                    </Stack>
                </Paper>

                {/* Форма отклика для переводчиков */}
                {canBid && (
                    <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
                        <Stack spacing={2}>
                            <Typography variant="h6" fontWeight={700}>
                                Оставить отклик
                            </Typography>
                            <BidForm orderId={order.id} onSuccess={handleBidCreated} />
                        </Stack>
                    </Paper>
                )}

                {/* Список откликов для клиента */}
                {canViewBids && (
                    <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
                        <Stack spacing={2}>
                            <Typography variant="h6" fontWeight={700}>
                                Отклики переводчиков
                            </Typography>
                            <BidsList orderId={order.id} onBidAccepted={handleBidAccepted} />
                        </Stack>
                    </Paper>
                )}

                {/* Сообщение для переводчиков, если заказ уже имеет переводчика */}
                {isTranslator && order.translator && order.status === "published" && (
                    <Alert severity="info">
                        На этот заказ уже назначен переводчик.
                    </Alert>
                )}

                {/* Сообщение для переводчиков, если заказ не опубликован */}
                {isTranslator && order.status !== "published" && (
                    <Alert severity="warning">
                        Этот заказ не доступен для откликов.
                    </Alert>
                )}
            </Stack>
        </Container>
    );
}

