import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, LinearProgress, Snackbar } from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuthStore } from "../stores/authStore";
import { buildNotificationsWsUrl } from "../utils/chat";
import { useChatNotificationStore } from "../stores/chatNotificationsStore";

const SNACKBAR_PREVIEW_LIMIT = 120;

function ChatNotificationCenter() {
    const navigate = useNavigate();
    const accessToken = useAuthStore((state) => state.accessToken);
    const user = useAuthStore((state) => state.user);
    const open = useChatNotificationStore((state) => state.open);
    const message = useChatNotificationStore((state) => state.message);
    const threadId = useChatNotificationStore((state) => state.threadId);
    const enqueueThreadUpdate = useChatNotificationStore((state) => state.enqueueThreadUpdate);
    const showNotification = useChatNotificationStore((state) => state.show);
    const hideNotification = useChatNotificationStore((state) => state.hide);

    const socketRef = useRef<WebSocket | null>(null);
    const retryRef = useRef<number | null>(null);
    const showRef = useRef(showNotification);

    useEffect(() => {
        showRef.current = showNotification;
    }, [showNotification]);

    useEffect(() => {
        let isUnmounted = false;

        const cleanupSocket = () => {
            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.onerror = null;
                socketRef.current.onmessage = null;
                socketRef.current.close();
                socketRef.current = null;
            }
        };

        if (!accessToken) {
            cleanupSocket();
            return () => {
                isUnmounted = true;
                if (retryRef.current) {
                    window.clearTimeout(retryRef.current);
                    retryRef.current = null;
                }
                cleanupSocket();
            };
        }

        const connect = () => {
            if (!accessToken) {
                return;
            }

            cleanupSocket();

            const url = buildNotificationsWsUrl(accessToken);
            const socket = new WebSocket(url);
            socketRef.current = socket;

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const eventType: string | undefined = data?.type;
                    if (eventType !== "chat.thread_update" && eventType !== "message.new") {
                        return;
                    }
                    const thread = Number(data.thread_id ?? data.thread);
                    if (!Number.isFinite(thread) || thread <= 0) {
                        return;
                    }
                    const senderId = Number(data.last_message_sender_id ?? data.sender);
                    if (Number.isFinite(senderId) && senderId === user?.id) {
                        return;
                    }
                    const rawText = (data.last_message_text ?? data.text ?? "").trim();
                    if (!rawText) {
                        return;
                    }
                    const truncated =
                        rawText.length > SNACKBAR_PREVIEW_LIMIT
                            ? `${rawText.slice(0, SNACKBAR_PREVIEW_LIMIT - 3)}...`
                            : rawText;
                    const senderFirst = (data.last_message_sender_first_name ?? data.sender_first_name ?? "").trim();
                    const senderLast = (data.last_message_sender_last_name ?? data.sender_last_name ?? "").trim();
                    const senderName = [senderFirst, senderLast].filter(Boolean).join(" ").trim();
                    enqueueThreadUpdate({
                        threadId: thread,
                        last_message_text: data.last_message_text ?? data.text ?? undefined,
                        last_message_created_at: data.last_message_created_at ?? data.created_at ?? undefined,
                        last_message_sender_id: Number.isFinite(senderId) ? senderId : undefined,
                        last_message_sender_first_name: senderFirst || undefined,
                        last_message_sender_last_name: senderLast || undefined,
                        unread_count:
                            typeof data.unread_count === "number" ? Math.max(data.unread_count, 0) : undefined,
                        updated_at: (data.last_message_created_at ?? data.created_at ?? null) as string | null,
                    });
                    const preview = `${senderName || "Новое сообщение"}: ${truncated}`;
                    if (typeof showRef.current === "function") {
                        showRef.current({
                        threadId: thread,
                        message: preview,
                        senderId: Number.isFinite(senderId) ? senderId : undefined,
                    });
                    }
                } catch (error) {
                    console.error("Не удалось обработать уведомление чата", error);
                }
            };

            socket.onerror = () => {
                socket.close();
            };

            socket.onclose = () => {
                socketRef.current = null;
                if (!isUnmounted) {
                    if (retryRef.current) {
                        window.clearTimeout(retryRef.current);
                        retryRef.current = null;
                    }
                    retryRef.current = window.setTimeout(connect, 3000);
                }
            };
        };

        connect();

        return () => {
            isUnmounted = true;
            if (retryRef.current) {
                window.clearTimeout(retryRef.current);
                retryRef.current = null;
            }
            cleanupSocket();
        };
    }, [accessToken, enqueueThreadUpdate, user?.id]);

    const handleClose = (_event?: unknown, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        hideNotification();
    };

    const handleClick = () => {
        if (!threadId) {
            hideNotification();
            return;
        }
        const basePath = user?.role === "translator" ? "/translator/chats" : "/chats";
        const search = new URLSearchParams();
        search.set("thread", String(threadId));
        navigate(`${basePath}?${search.toString()}`);
        hideNotification();
    };

    return (
        <Snackbar
            open={open}
            message={message}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            onClose={handleClose}
            onClick={handleClick}
        />
    );
}

export default function RootLayout() {
    const initialize = useAuthStore((state) => state.initialize);
    const isReady = useAuthStore((state) => state.isReady);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <Box minHeight="100vh" display="flex" flexDirection="column">
            <Header />
            {!isReady && <LinearProgress color="primary" />}
            <Box component="main" flex={1}>
                <Outlet />
            </Box>
            <Footer />
            <ChatNotificationCenter />
        </Box>
    );
}
