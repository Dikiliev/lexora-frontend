import { type ChangeEvent, type ReactElement } from "react";
import {
    Box,
    Button,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { type ChatOrderDTO } from "../utils/chat";

export type ChatOrderAction =
    | "accept"
    | "reject"
    | "request-change"
    | "mark-paid"
    | "mark-done"
    | "approve"
    | "dispute";

interface ChatOrderCardProps {
    order: ChatOrderDTO;
    isClient: boolean;
    isTranslator: boolean;
    loadingAction?: ChatOrderAction | "upload" | null;
    onAction?: (action: ChatOrderAction) => void;
    onRequestChange?: (order: ChatOrderDTO) => void;
    onUploadFile?: (order: ChatOrderDTO, file: File) => void;
}

const STATUS_META: Record<
    ChatOrderDTO["status"],
    {
        label: string;
        color: "default" | "success" | "error" | "info" | "warning";
        icon?: ReactElement;
    }
> = {
    pending_translator: {
        label: "Ждём ответа переводчика",
        color: "warning",
        icon: <HourglassTopIcon fontSize="small" />,
    },
    pending_client_payment: {
        label: "Ожидает оплату клиента",
        color: "warning",
        icon: <HourglassTopIcon fontSize="small" />,
    },
    in_progress: {
        label: "В работе",
        color: "info",
        icon: <HourglassTopIcon fontSize="small" />,
    },
    waiting_client_approval: {
        label: "Ждёт подтверждения",
        color: "info",
        icon: <HourglassTopIcon fontSize="small" />,
    },
    completed: {
        label: "Завершён",
        color: "success",
        icon: <CheckCircleIcon fontSize="small" />,
    },
    cancelled: {
        label: "Отменён",
        color: "default",
        icon: <ErrorOutlineIcon fontSize="small" />,
    },
    disputed: {
        label: "Спор",
        color: "error",
        icon: <ErrorOutlineIcon fontSize="small" />,
    },
};

function formatPrice(price: string, currency: string): string {
    const num = Number(price);
    if (!Number.isFinite(num)) return "—";
    const safeCurrency = currency || "RUB";

    try {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: safeCurrency,
        }).format(num);
    } catch {
        return `${num.toLocaleString("ru-RU")} ${safeCurrency}`;
    }
}

function formatDeadline(deadline: string | null): string | null {
    if (!deadline) return null;
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return deadline;
    return date.toLocaleString("ru-RU");
}

export function ChatOrderCard({
    order,
    isClient,
    isTranslator,
    loadingAction = null,
    onAction,
    onRequestChange,
    onUploadFile,
}: ChatOrderCardProps) {
    const statusMeta = STATUS_META[order.status];
    const isPaid = order.is_paid;
    const priceLabel = formatPrice(order.price, order.currency);
    const deadlineLabel = formatDeadline(order.deadline);

    const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length || !onUploadFile) return;
        onUploadFile(order, event.target.files[0]);
        event.target.value = "";
    };

    const showAcceptReject =
        isTranslator && order.status === "pending_translator";

    const showRequestChange =
        isTranslator &&
        ["pending_translator", "pending_client_payment"].includes(order.status);

    const showMarkPaid =
        isClient && order.status === "pending_client_payment";

    const showMarkDone =
        isTranslator && order.status === "in_progress";

    const showApprove =
        isClient && order.status === "waiting_client_approval";

    const showDispute =
        isClient &&
        ["in_progress", "waiting_client_approval"].includes(order.status);

    const showUpload =
        isTranslator &&
        ["in_progress", "waiting_client_approval"].includes(order.status) &&
        Boolean(onUploadFile);

    return (
        <Paper
            variant="outlined"
            sx={(theme) => ({
                p: 2,
                borderRadius: 2,
                width: "100%",
                bgcolor:
                    theme.palette.mode === "dark"
                        ? "grey.900"
                        : "grey.50",
                borderColor: theme.palette.divider,
                boxShadow: "0 6px 18px rgba(10,11,13,.04)",
                transition:
                    "transform .12s ease, box-shadow .12s ease, border-color .12s ease, background-color .12s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 28px rgba(10,11,13,.08)",
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                    bgcolor: theme.palette.background.paper,
                },
            })}
        >
            <Stack spacing={1.75}>
                {/* Верхняя строка: название + статус/оплата */}
                <Stack
                    direction="row"
                    spacing={1.5}
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mb: 0.25 }}
                        >
                            Заказ
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ wordBreak: "break-word" }}
                        >
                            {order.title}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.25 }}
                        >
                            {order.source_lang} → {order.target_lang}
                            {order.volume ? ` · ${order.volume}` : ""}
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ flexShrink: 0 }}
                    >
                        <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                        >
                            {statusMeta.icon && (
                                <Box
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: (theme) => {
                                            switch (statusMeta.color) {
                                                case "success":
                                                    return alpha(
                                                        theme.palette.success
                                                            .main,
                                                        0.1,
                                                    );
                                                case "error":
                                                    return alpha(
                                                        theme.palette.error
                                                            .main,
                                                        0.1,
                                                    );
                                                case "warning":
                                                    return alpha(
                                                        theme.palette.warning
                                                            .main,
                                                        0.12,
                                                    );
                                                case "info":
                                                    return alpha(
                                                        theme.palette.info.main,
                                                        0.12,
                                                    );
                                                default:
                                                    return theme.palette
                                                        .grey[100];
                                            }
                                        },
                                        color: (theme) => {
                                            switch (statusMeta.color) {
                                                case "success":
                                                    return theme.palette
                                                        .success.main;
                                                case "error":
                                                    return theme.palette.error
                                                        .main;
                                                case "warning":
                                                    return theme.palette.warning
                                                        .main;
                                                case "info":
                                                    return theme.palette.info
                                                        .main;
                                                default:
                                                    return theme.palette.text
                                                        .secondary;
                                            }
                                        },
                                    }}
                                >
                                    {statusMeta.icon}
                                </Box>
                            )}
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600 }}
                            >
                                {statusMeta.label}
                            </Typography>
                        </Stack>

                        {isPaid && (
                            <Box
                                sx={(theme) => ({
                                    px: 0.9,
                                    py: 0.2,
                                    borderRadius: 999,
                                    bgcolor: alpha(
                                        theme.palette.success.main,
                                        0.08,
                                    ),
                                    border: `1px solid ${alpha(
                                        theme.palette.success.main,
                                        0.25,
                                    )}`,
                                })}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 600, color: "success.main" }}
                                >
                                    Оплачено
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </Stack>

                {/* Описание */}
                {order.description && (
                    <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                    >
                        {order.description}
                    </Typography>
                )}

                {/* Цена и дедлайн */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={0.75}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                >
                    <Typography variant="subtitle2">
                        {priceLabel}
                    </Typography>
                    {deadlineLabel && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                opacity: 0.9,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.75,
                            }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    bgcolor: "text.disabled",
                                }}
                            />
                            Дедлайн: {deadlineLabel}
                        </Typography>
                    )}
                </Stack>

                {/* Файлы */}
                {order.attachments?.length > 0 && (
                    <Stack spacing={0.75}>
                        <Divider />
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Файлы
                        </Typography>
                        {order.attachments.map((attachment) => (
                            <Stack
                                key={attachment.id}
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                                component="a"
                                href={attachment.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    textDecoration: "none",
                                    color: "inherit",
                                    fontSize: 14,
                                }}
                            >
                                <AttachFileIcon fontSize="small" />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        maxWidth: 260,
                                    }}
                                >
                                    {attachment.original_name}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                )}

                {/* Действия */}
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ pt: 0.5 }}
                >
                    {showAcceptReject && (
                        <>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={() => onAction?.("accept")}
                                disabled={loadingAction === "accept"}
                            >
                                Принять
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                color="inherit"
                                onClick={() => onAction?.("reject")}
                                disabled={loadingAction === "reject"}
                            >
                                Отклонить
                            </Button>
                        </>
                    )}

                    {showMarkPaid && (
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => onAction?.("mark-paid")}
                            disabled={loadingAction === "mark-paid"}
                        >
                            Пометить как оплачено
                        </Button>
                    )}

                    {showMarkDone && (
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => onAction?.("mark-done")}
                            disabled={loadingAction === "mark-done"}
                        >
                            Отметить как выполнено
                        </Button>
                    )}

                    {showApprove && (
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => onAction?.("approve")}
                            disabled={loadingAction === "approve"}
                        >
                            Подтвердить работу
                        </Button>
                    )}

                    {showDispute && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => onAction?.("dispute")}
                            disabled={loadingAction === "dispute"}
                        >
                            Открыть спор
                        </Button>
                    )}

                    {showRequestChange && (
                        <Button
                            size="small"
                            variant="text"
                            color="inherit"
                            onClick={() => onRequestChange?.(order)}
                            disabled={loadingAction === "request-change"}
                        >
                            Предложить другие условия
                        </Button>
                    )}

                    {showUpload && (
                        <Button
                            size="small"
                            variant="outlined"
                            component="label"
                            startIcon={<UploadFileIcon />}
                            disabled={loadingAction === "upload"}
                        >
                            Загрузить файл
                            <input
                                type="file"
                                hidden
                                onChange={handleUpload}
                            />
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
