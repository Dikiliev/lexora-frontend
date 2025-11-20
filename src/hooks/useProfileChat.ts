import { useEffect, useState, useRef, useMemo } from "react";
import type { FormEvent } from "react";
import {
    buildThreadWsUrl,
    createThread,
    fetchThreadMessages,
    sendThreadMessage,
    upsertMessage,
    type ChatMessageDTO,
    type ChatThreadDTO,
} from "../utils/chat";

interface UseProfileChatOptions {
    translatorProfileId: number;
    accessToken: string | null | undefined;
    userId: number | undefined;
    isOpen: boolean;
}

export function useProfileChat({
    translatorProfileId,
    accessToken,
    userId,
    isOpen,
}: UseProfileChatOptions) {
    const [chatThread, setChatThread] = useState<ChatThreadDTO | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessageDTO[]>([]);
    const [messageDraft, setMessageDraft] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);

    const orderedMessages = useMemo(
        () =>
            [...chatMessages].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            ),
        [chatMessages],
    );

    // WebSocket подключение
    useEffect(() => {
        if (!chatThread || !isOpen || !accessToken) return;

        const wsUrl = buildThreadWsUrl(chatThread.id, accessToken);
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "message.new") {
                    const nextMessage: ChatMessageDTO = {
                        id: data.id,
                        thread_id: data.thread,
                        sender: data.sender,
                        text: data.text,
                        is_read: Boolean(data.is_read),
                        created_at: data.created_at,
                    };
                    setChatMessages((prev) => upsertMessage(prev, nextMessage));
                } else if (data.type === "message.read" && data.message_id) {
                    setChatMessages((prev) =>
                        prev.map((item) =>
                            item.id === data.message_id ? { ...item, is_read: true } : item,
                        ),
                    );
                }
            } catch (err) {
                console.error("Не удалось обработать сообщение чата", err);
            }
        };

        socket.onerror = () => {
            setChatError("Не удалось установить WebSocket-соединение");
        };

        return () => {
            socketRef.current = null;
            socket.close();
        };
    }, [chatThread, isOpen, accessToken]);

    const openChat = async () => {
        if (!translatorProfileId) {
            setChatError("Не указан ID профиля переводчика");
            return;
        }

        setChatError(null);
        setChatLoading(true);
        setHistoryLoading(true);

        try {
            const thread = await createThread(translatorProfileId);
            setChatThread(thread);

            const history = await fetchThreadMessages(thread.id, { limit: 50 });
            const normalizedHistory = [...history.results].reverse();
            setChatMessages(normalizedHistory);
        } catch (err) {
            setChatError(err instanceof Error ? err.message : "Не удалось открыть чат");
        } finally {
            setChatLoading(false);
            setHistoryLoading(false);
        }
    };

    const closeChat = () => {
        setChatError(null);
        setMessageDraft("");
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    };

    const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!chatThread) return;

        const text = messageDraft.trim();
        if (!text) return;

        setChatError(null);

        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "message", text }));
            setMessageDraft("");
            return;
        }

        try {
            setIsSending(true);
            const message = await sendThreadMessage(chatThread.id, text);
            setChatMessages((prev) => upsertMessage(prev, message));
            setMessageDraft("");
        } catch (err) {
            setChatError(err instanceof Error ? err.message : "Не удалось отправить сообщение");
        } finally {
            setIsSending(false);
        }
    };

    return {
        chatThread,
        messages: orderedMessages,
        messageDraft,
        setMessageDraft,
        chatLoading,
        historyLoading,
        chatError,
        isSending,
        openChat,
        closeChat,
        sendMessage,
    };
}

