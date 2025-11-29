import type { MutableRefObject } from "react";
import {
    Alert,
    Avatar,
    Box,
    CircularProgress,
    Link,
    Stack,
    Typography,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Link as RouterLink } from "react-router-dom";
import { API_URL } from "../../utils/api";

import type { ChatMessageDTO, ChatOrderDTO } from "../../utils/chat";
import { formatMessageTime } from "../../utils/chat";
import { ChatOrderCard, type ChatOrderAction } from "../ChatOrderCard";

// Функция для получения полного URL аватара
function getAvatarUrl(avatar: string | null | undefined): string | undefined {
    if (!avatar) return undefined;
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
        return avatar;
    }
    const baseUrl = API_URL.replace("/api/v1", "");
    return `${baseUrl}${avatar}`;
}

// Функция для получения инициалов
function getInitials(firstName: string | null | undefined, lastName: string | null | undefined): string {
    const first = firstName?.[0]?.toUpperCase() ?? "";
    const last = lastName?.[0]?.toUpperCase() ?? "";
    return first + last || "?";
}

interface ChatMessagesListProps {
    containerRef: MutableRefObject<HTMLDivElement | null>;
    messages: ChatMessageDTO[];
    counterpartyTitle: string | null;
    counterpartyTranslatorId?: number | null;
    counterpartyUserId?: number | null;
    selfUserId?: number;
    initialLoading: boolean;
    ordersLoading: boolean;
    incrementalLoading: boolean;
    error: string | null;
    orders: ChatOrderDTO[];
    resolveOrderRoles: (order: ChatOrderDTO) => { isClient: boolean; isTranslator: boolean };
    activeOrderAction: Record<number, ChatOrderAction | "upload" | null>;
    onOrderAction: (order: ChatOrderDTO, action: ChatOrderAction) => void;
    onRequestChange: (order: ChatOrderDTO) => void;
    onUploadFile: (order: ChatOrderDTO, file: File) => void;
}

export function ChatMessagesList({
    containerRef,
    messages,
    counterpartyTitle,
    counterpartyTranslatorId,
    counterpartyUserId,
    selfUserId,
    initialLoading,
    ordersLoading,
    incrementalLoading,
    error,
    orders,
    resolveOrderRoles,
    activeOrderAction,
    onOrderAction,
    onRequestChange,
    onUploadFile,
}: ChatMessagesListProps) {
    return (
        <Box
            ref={containerRef}
            sx={{
                flex: 1,
                overflowY: "auto",
                px: { xs: 2, md: 3 },
                py: 2,
                position: "relative",
                minHeight: 0,
                bgcolor: "background.default",
            }}
        >
            {ordersLoading && (
                <Stack alignItems="center" sx={{ pb: 1 }}>
                    <CircularProgress size={14} />
                </Stack>
            )}
            {incrementalLoading && (
                <Stack alignItems="center" sx={{ pb: 2 }}>
                    <CircularProgress size={18} thickness={5} />
                </Stack>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {initialLoading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                </Stack>
            ) : messages.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Сообщений пока нет. Напишите собеседнику, чтобы начать диалог.
                </Typography>
            ) : (
                <Stack spacing={1.5} sx={{ pb: 1 }}>
                    {messages.map((message) => {
                        if (message.message_type === "system") {
                            const payload = message.payload as { order?: ChatOrderDTO } | undefined;
                            const payloadOrder = payload?.order;
                            if (payloadOrder) {
                                const orderFromState =
                                    orders.find((item) => item.id === payloadOrder.id) ?? payloadOrder;
                                const roles = resolveOrderRoles(orderFromState);
                                return (
                                    <ChatOrderCard
                                        key={message.id}
                                        order={orderFromState}
                                        isClient={roles.isClient}
                                        isTranslator={roles.isTranslator}
                                        loadingAction={activeOrderAction[orderFromState.id] ?? null}
                                        onAction={(action) => onOrderAction(orderFromState, action)}
                                        onRequestChange={onRequestChange}
                                        onUploadFile={onUploadFile}
                                    />
                                );
                            }
                            return (
                                <Stack key={message.id} spacing={0.5} alignItems="flex-start">
                                    <Typography variant="caption" color="text.secondary">
                                        Системное сообщение
                                    </Typography>
                                    <Box
                                        sx={{
                                            maxWidth: "70%",
                                            px: 1.75,
                                            py: 1,
                                            borderRadius: 2,
                                            bgcolor: "grey.50",
                                            color: "text.primary",
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {message.text}
                                    </Box>
                                </Stack>
                            );
                        }

                        const isOwn = selfUserId !== undefined && message.sender === selfUserId;
                        const senderAvatarUrl = message.sender_avatar ? getAvatarUrl(message.sender_avatar) : undefined;
                        const senderInitials = getInitials(message.sender_first_name, message.sender_last_name);
                        
                        return (
                            <Stack
                                key={message.id}
                                direction="row"
                                spacing={1}
                                alignItems="flex-start"
                                justifyContent={isOwn ? "flex-end" : "flex-start"}
                                sx={{ width: "100%" }}
                            >
                                {!isOwn && (
                                    <Avatar
                                        src={senderAvatarUrl}
                                        sx={{ width: 32, height: 32, fontSize: 14 }}
                                    >
                                        {senderInitials}
                                    </Avatar>
                                )}
                                <Stack
                                    alignItems={isOwn ? "flex-end" : "flex-start"}
                                    spacing={0.5}
                                    sx={{ maxWidth: "70%", minWidth: 0 }}
                                >
                                    {!isOwn && (counterpartyTranslatorId || counterpartyUserId) ? (
                                        <Link
                                            component={RouterLink}
                                            to={counterpartyTranslatorId ? `/translator/${counterpartyTranslatorId}` : `/client/${counterpartyUserId}`}
                                            underline="hover"
                                            sx={{ 
                                                color: "text.secondary",
                                                "&:hover": { color: "primary.main" },
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Typography variant="caption">
                                                {counterpartyTitle ?? "Собеседник"}
                                            </Typography>
                                        </Link>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            {isOwn ? "Вы" : counterpartyTitle ?? "Собеседник"}
                                        </Typography>
                                    )}
                                    <Box
                                        sx={{
                                            px: 1.75,
                                            py: 1.1,
                                            borderRadius: 3,
                                            bgcolor: isOwn ? "primary.main" : "grey.100",
                                            color: isOwn ? "primary.contrastText" : "text.primary",
                                            borderBottomRightRadius: isOwn ? 0 : 3,
                                            borderBottomLeftRadius: isOwn ? 3 : 0,
                                            boxShadow: 0,
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {message.text}
                                    </Box>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ mt: 0.5, pr: isOwn ? 0.5 : 0 }}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        {formatMessageTime(message.created_at)}
                                    </Typography>
                                    {isOwn && (
                                        <Stack
                                            direction="row"
                                            spacing={0.5}
                                            alignItems="center"
                                        >
                                            {message.isFailed ? (
                                                <Typography variant="caption" color="error">
                                                    ошибка отправки
                                                </Typography>
                                            ) : message.isPending ? (
                                                <AccessTimeIcon fontSize="inherit" />
                                            ) : message.is_read ? (
                                                <DoneAllIcon fontSize="inherit" color="primary" />
                                            ) : message.isDelivered ? (
                                                <DoneAllIcon
                                                    fontSize="inherit"
                                                    sx={{ opacity: 0.6 }}
                                                />
                                            ) : (
                                                <DoneIcon fontSize="inherit" sx={{ opacity: 0.6 }} />
                                            )}
                                        </Stack>
                                    )}
                                </Stack>
                                </Stack>
                            </Stack>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}
