import { type ChangeEvent, type ReactElement } from "react";
import {
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
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
    { label: string; color: "default" | "success" | "error" | "info" | "warning"; icon?: ReactElement }
> = {
    pending_translator: { label: "Ждём переводчика", color: "warning", icon: <HourglassTopIcon fontSize="small" /> },
    pending_client_payment: { label: "Ожидает оплату", color: "warning", icon: <HourglassTopIcon fontSize="small" /> },
    in_progress: { label: "В работе", color: "info", icon: <HourglassTopIcon fontSize="small" /> },
    waiting_client_approval: { label: "Ждёт подтверждения", color: "info", icon: <HourglassTopIcon fontSize="small" /> },
    completed: { label: "Завершён", color: "success", icon: <CheckCircleIcon fontSize="small" /> },
    cancelled: { label: "Отменён", color: "default", icon: <ErrorOutlineIcon fontSize="small" /> },
    disputed: { label: "Спор", color: "error", icon: <ErrorOutlineIcon fontSize="small" /> },
};

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

    const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length || !onUploadFile) {
            return;
        }
        onUploadFile(order, event.target.files[0]);
        event.target.value = "";
    };

    const showAcceptReject = isTranslator && order.status === "pending_translator";
    const showRequestChange = isTranslator && ["pending_translator", "pending_client_payment"].includes(order.status);
    const showMarkPaid = isClient && order.status === "pending_client_payment";
    const showMarkDone = isTranslator && order.status === "in_progress";
    const showApprove =
        isClient && order.status === "waiting_client_approval";
    const showDispute =
        isClient && ["in_progress", "waiting_client_approval"].includes(order.status);
    const showUpload =
        isTranslator && ["in_progress", "waiting_client_approval"].includes(order.status) && Boolean(onUploadFile);

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                width: "100%",
                bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.900" : "grey.50"),
            }}
        >
            <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {order.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {order.source_lang} → {order.target_lang}
                            {order.volume ? ` · ${order.volume}` : ""}
                        </Typography>
                    </Box>
                    <Chip
                        label={statusMeta.label}
                        icon={statusMeta.icon}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            backgroundColor: (theme) => {
                                switch (statusMeta.color) {
                                    case "success":
                                        return theme.palette.success.main;
                                    case "error":
                                        return theme.palette.error.main;
                                    case "warning":
                                        return theme.palette.warning.main;
                                    case "info":
                                        return theme.palette.info.main;
                                    default:
                                        return theme.palette.grey[300];
                                }
                            },
                            color: (theme) => {
                                switch (statusMeta.color) {
                                    case "success":
                                        return theme.palette.success.contrastText;
                                    case "error":
                                        return theme.palette.error.contrastText;
                                    case "warning":
                                        return theme.palette.warning.contrastText;
                                    case "info":
                                        return theme.palette.info.contrastText;
                                    default:
                                        return theme.palette.text.primary;
                                }
                            },
                            border: "none",
                            "& .MuiChip-icon": {
                                color: "inherit",
                            },
                        }}
                    />
                </Stack>

                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {order.description}
                </Typography>

                <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Typography variant="subtitle2">
                        {Number(order.price).toLocaleString("ru-RU", {
                            style: "currency",
                            currency: order.currency || "RUB",
                        })}
                    </Typography>
                    {order.deadline && (
                        <Typography variant="body2" color="text.secondary">
                            Дедлайн: {new Date(order.deadline).toLocaleString("ru-RU")}
                        </Typography>
                    )}
                </Stack>

                {order.attachments?.length > 0 && (
                    <Stack spacing={0.5}>
                        <Divider />
                        <Typography variant="subtitle2">Файлы:</Typography>
                        {order.attachments.map((attachment) => (
                            <Stack
                                direction="row"
                                key={attachment.id}
                                spacing={1}
                                alignItems="center"
                                component="a"
                                href={attachment.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textDecoration: "none", color: "inherit" }}
                            >
                                <AttachFileIcon fontSize="small" />
                                <Typography variant="body2">{attachment.original_name}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                )}

                <Stack direction="row" spacing={1} flexWrap="wrap">
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
                                color="secondary"
                                onClick={() => onAction?.("reject")}
                                disabled={loadingAction === "reject"}
                            >
                                Отклонить
                            </Button>
                        </>
                    )}

                    {showRequestChange && (
                        <Button
                            size="small"
                            variant="text"
                            onClick={() => onRequestChange?.(order)}
                            disabled={loadingAction === "request-change"}
                        >
                            Предложить другие условия
                        </Button>
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
                            Принять работу
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

                    {showUpload && (
                        <Button
                            size="small"
                            variant="text"
                            component="label"
                            startIcon={<UploadFileIcon />}
                            disabled={loadingAction === "upload"}
                        >
                            Загрузить файл
                            <input type="file" hidden onChange={handleUpload} />
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}


