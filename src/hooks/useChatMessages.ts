import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import type { ChatMessageDTO, ChatMessagesResponse, ChatThreadDTO } from "../utils/chat";
import { buildThreadWsUrl, fetchThreadMessages, sendThreadMessage, upsertMessage } from "../utils/chat";
import { getThreadSortValue } from "../utils/chatThreads";

const MESSAGES_PAGE_SIZE = 20;

interface UseChatMessagesOptions {
    selectedThreadId: number | null;
    selectedThread: ChatThreadDTO | null;
    accessToken: string | null | undefined;
    selfUserId?: number;
    onThreadsUpdate: (updater: (prev: ChatThreadDTO[]) => ChatThreadDTO[]) => void;
    onOrdersSync?: (messages: ChatMessageDTO[]) => void;
}

export function useChatMessages({
    selectedThreadId,
    selectedThread,
    accessToken,
    selfUserId,
    onThreadsUpdate,
    onOrdersSync,
}: UseChatMessagesOptions) {
    const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
    const [initialLoading, setInitialLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [messageDraft, setMessageDraft] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
    const tempIdRef = useRef(0);
    const socketRef = useRef<WebSocket | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const loadMessages = useCallback(
        async (
            threadId: number,
            { before, append }: { before?: string | null; append?: boolean } = {},
        ) => {
            const params: Record<string, string | number | undefined> = { limit: MESSAGES_PAGE_SIZE };
            if (before) {
                params.before = before;
            }

            setError(null);

            const container = messagesContainerRef.current;
            let previousScrollHeight = 0;
            let previousScrollTop = 0;
            if (append && container) {
                previousScrollHeight = container.scrollHeight;
                previousScrollTop = container.scrollTop;
            }

            const response: ChatMessagesResponse = await fetchThreadMessages(threadId, params);
            const pageAscending = response.results ?? [];
            const normalizedPage = pageAscending.map((message) => ({
                ...message,
                message_type: message.message_type ?? "text",
                payload: message.payload ?? null,
                isDelivered: true,
                isPending: false,
                isFailed: false,
            }));

            setMessages((prev) => (append ? [...normalizedPage, ...prev] : normalizedPage));
            onOrdersSync?.(normalizedPage);
            setNextCursor(response.next_before ?? null);
            setHasMore(Boolean(response.has_more));
            const updateLatest = !append && response.latest;

            onThreadsUpdate((prev) =>
                prev.map((thread) =>
                    thread.id === threadId
                        ? {
                              ...thread,
                              unread_count: append ? thread.unread_count : response.thread_unread_count ?? 0,
                              ...(updateLatest
                                  ? {
                                        last_message_text: updateLatest.text ?? thread.last_message_text,
                                        last_message_created_at:
                                            updateLatest.created_at ?? thread.last_message_created_at,
                                        last_message_sender_id:
                                            updateLatest.sender_id ?? thread.last_message_sender_id,
                                        last_message_sender_first_name:
                                            updateLatest.sender_first_name ?? thread.last_message_sender_first_name,
                                        last_message_sender_last_name:
                                            updateLatest.sender_last_name ?? thread.last_message_sender_last_name,
                                        updated_at: updateLatest.created_at ?? thread.updated_at,
                                    }
                                  : {}),
                          }
                        : thread,
                ),
            );

            if (append && container) {
                requestAnimationFrame(() => {
                    const newScrollHeight = container.scrollHeight;
                    container.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop;
                });
            } else {
                setShouldScrollToBottom(true);
            }
        },
        [onThreadsUpdate, onOrdersSync],
    );

    useEffect(() => {
        if (!selectedThreadId) {
            setMessages([]);
            setHasMore(false);
            setNextCursor(null);
            return;
        }

        setInitialLoading(true);
        setLoadingMore(false);
        setError(null);
        setMessages([]);
        setHasMore(false);
        setNextCursor(null);

        loadMessages(selectedThreadId)
            .catch((err) => {
                setError(err instanceof Error ? err.message : "Не удалось загрузить сообщения");
                setMessages([]);
            })
            .finally(() => setInitialLoading(false));
    }, [selectedThreadId, loadMessages]);

    useEffect(() => {
        if (!selectedThreadId || !accessToken) {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            setError(null);
            return;
        }

        const wsUrl = buildThreadWsUrl(selectedThreadId, accessToken);
        console.log("[WebSocket] Connecting to:", wsUrl);
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        let isConnected = false;
        
        socket.onopen = () => {
            console.log("[WebSocket] Connected successfully to thread", selectedThreadId);
            isConnected = true;
            setError(null);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "message.new") {
                    const nextMessage: ChatMessageDTO = {
                        id: data.id,
                        thread_id: data.thread,
                        sender: data.sender,
                        sender_first_name: data.sender_first_name,
                        sender_last_name: data.sender_last_name,
                        text: data.text,
                        message_type: data.message_type ?? "text",
                        payload: data.payload ?? null,
                        is_read: Boolean(data.is_read),
                        created_at: data.created_at,
                        isDelivered: true,
                    };
                    onThreadsUpdate((prev) =>
                        prev
                            .map((thread) => {
                                if (thread.id !== data.thread) {
                                    return thread;
                                }
                                const incrementUnread =
                                    selectedThreadId === data.thread
                                        ? 0
                                        : (thread.unread_count ?? 0) + (data.sender === selfUserId ? 0 : 1);
                                return {
                                    ...thread,
                                    updated_at: nextMessage.created_at ?? thread.updated_at,
                                    last_message_text: nextMessage.text ?? thread.last_message_text,
                                    last_message_created_at:
                                        nextMessage.created_at ?? thread.last_message_created_at,
                                    last_message_sender_id:
                                        nextMessage.sender ?? thread.last_message_sender_id,
                                    last_message_sender_first_name:
                                        nextMessage.sender_first_name ?? thread.last_message_sender_first_name,
                                    last_message_sender_last_name:
                                        nextMessage.sender_last_name ?? thread.last_message_sender_last_name,
                                    unread_count: incrementUnread,
                                };
                            })
                            .sort((a, b) => getThreadSortValue(b) - getThreadSortValue(a)),
                    );

                    if (data.thread === selectedThreadId) {
                        setMessages((prev) => upsertMessage(prev, nextMessage));
                        setShouldScrollToBottom(true);
                        if (data.sender !== selfUserId && socketRef.current?.readyState === WebSocket.OPEN) {
                            socketRef.current.send(JSON.stringify({ type: "read", message_id: data.id }));
                        }
                    }
                    if (nextMessage.message_type === "system") {
                        const orderPayload = (nextMessage.payload as { order?: unknown } | undefined)?.order;
                        if (orderPayload) {
                            onOrdersSync?.([nextMessage]);
                        }
                    }
                } else if (data.type === "message.read" && data.message_id) {
                    setMessages((prev) =>
                        prev.map((item) =>
                            item.id === data.message_id
                                ? { ...item, is_read: true, isDelivered: true }
                                : item,
                        ),
                    );
                    if (selectedThreadId) {
                        onThreadsUpdate((prev) =>
                            prev.map((thread) =>
                                thread.id === selectedThreadId ? { ...thread, unread_count: 0 } : thread,
                            ),
                        );
                    }
                } else if (data.type === "chat.thread_update") {
                    const threadId: number | undefined = data.thread_id ?? data.thread;
                    if (!threadId) return;
                    const updates = {
                        last_message_text: data.last_message_text as string | undefined,
                        last_message_created_at: data.last_message_created_at as string | undefined,
                        last_message_sender_id: data.last_message_sender_id as number | undefined,
                        last_message_sender_first_name: data.last_message_sender_first_name as string | undefined,
                        last_message_sender_last_name: data.last_message_sender_last_name as string | undefined,
                        updated_at: (data.last_message_created_at as string | undefined) ?? undefined,
                    };
                    const incomingUnreadCount =
                        typeof data.unread_count === "number" ? Math.max(data.unread_count, 0) : undefined;

                    onThreadsUpdate((prev) =>
                        prev
                            .map((thread) => {
                                if (thread.id !== threadId) {
                                    return thread;
                                }
                                const nextUnread =
                                    threadId === selectedThreadId
                                        ? 0
                                        : incomingUnreadCount ?? thread.unread_count ?? 0;
                                return {
                                    ...thread,
                                    last_message_text:
                                        updates.last_message_text ?? thread.last_message_text,
                                    last_message_created_at:
                                        updates.last_message_created_at ?? thread.last_message_created_at,
                                    last_message_sender_id:
                                        updates.last_message_sender_id ?? thread.last_message_sender_id,
                                    last_message_sender_first_name:
                                        updates.last_message_sender_first_name ?? thread.last_message_sender_first_name,
                                    last_message_sender_last_name:
                                        updates.last_message_sender_last_name ?? thread.last_message_sender_last_name,
                                    updated_at: updates.updated_at ?? thread.updated_at,
                                    unread_count: nextUnread,
                                };
                            })
                            .sort((a, b) => getThreadSortValue(b) - getThreadSortValue(a)),
                    );
                }
            } catch (error) {
                console.error("Не удалось обработать сообщение чата", error);
            }
        };

        socket.onerror = (error) => {
            console.error("[WebSocket] Connection error:", error);
            console.error("[WebSocket] URL was:", wsUrl);
            // Не устанавливаем ошибку сразу, подождем onclose
        };
        
        socket.onclose = (event) => {
            console.log("[WebSocket] Connection closed:", event.code, event.reason);
            // Код 1000 - нормальное закрытие
            // Код 1006 - закрытие без handshake (может быть из-за React StrictMode)
            // Устанавливаем ошибку только если:
            // 1. Это не нормальное закрытие (код 1000)
            // 2. Это не закрытие без handshake (код 1006) - часто из-за React StrictMode
            // 3. Соединение не было установлено (isConnected === false)
            // 4. Это все еще текущее соединение
            if (!isConnected && event.code !== 1000 && event.code !== 1006 && socketRef.current === socket) {
                setError("Не удалось установить WebSocket-соединение");
            }
        };

        return () => {
            // Cleanup: закрываем соединение при размонтировании или изменении зависимостей
            if (socketRef.current === socket) {
                socketRef.current = null;
                // Убираем обработчики перед закрытием, чтобы не сработал onclose с ошибкой
                socket.onerror = null;
                socket.onclose = null;
                socket.close(1000, "Component unmounted");
            }
        };
    }, [selectedThreadId, accessToken, onThreadsUpdate, selfUserId, onOrdersSync]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container || !selectedThreadId) return;

        const handleScroll = () => {
            if (
                container.scrollTop <= 80 &&
                hasMore &&
                !loadingMore &&
                !initialLoading &&
                !isSending
            ) {
                if (!nextCursor) return;
                setLoadingMore(true);
                loadMessages(selectedThreadId, { before: nextCursor, append: true })
                    .catch((err) => {
                        setError(err instanceof Error ? err.message : "Не удалось загрузить сообщения");
                    })
                    .finally(() => setLoadingMore(false));
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [selectedThreadId, hasMore, loadingMore, initialLoading, isSending, nextCursor, loadMessages]);

    useEffect(() => {
        if (!shouldScrollToBottom) return;
        const container = messagesContainerRef.current;
        if (!container) return;
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
            setShouldScrollToBottom(false);
        });
    }, [shouldScrollToBottom, messages]);

    const handleSendMessage = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!selectedThread) return;
            const text = messageDraft.trim();
            if (!text) return;
            setError(null);

            const socket = socketRef.current;
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "message", text }));
                setMessageDraft("");
                setShouldScrollToBottom(true);
                return;
            }

            try {
                const tempId = `temp-${Date.now()}-${tempIdRef.current++}`;
                const optimisticMessage: ChatMessageDTO = {
                    id: tempIdRef.current,
                    tempId,
                    thread_id: selectedThread.id,
                    sender: selfUserId ?? 0,
                    sender_first_name: "",
                    sender_last_name: "",
                    message_type: "text",
                    payload: null,
                    text,
                    is_read: false,
                    created_at: new Date().toISOString(),
                    isPending: true,
                    isDelivered: false,
                    isFailed: false,
                } as ChatMessageDTO;

                setMessages((prev) => [...prev, optimisticMessage]);
                setShouldScrollToBottom(true);
                setMessageDraft("");

                let message: ChatMessageDTO;
                try {
                    setIsSending(true);
                    message = await sendThreadMessage(selectedThread.id, text);
                    message = {
                        ...message,
                        message_type: message.message_type ?? "text",
                        payload: message.payload ?? null,
                        isDelivered: true,
                    };
                } catch (err) {
                    setMessages((prev) =>
                        prev.map((item) =>
                            item.tempId === tempId ? { ...item, isPending: false, isFailed: true } : item,
                        ),
                    );
                    throw err;
                } finally {
                    setIsSending(false);
                }

                setMessages((prev) =>
                    prev.map((item) =>
                        item.tempId === tempId
                            ? {
                                  ...message,
                                  isDelivered: true,
                              }
                            : item,
                    ),
                );
                onThreadsUpdate((prev) =>
                    prev
                        .map((thread) =>
                            thread.id === selectedThread.id
                                ? {
                                      ...thread,
                                      updated_at: message.created_at,
                                  }
                                : thread,
                        )
                        .sort((a, b) => getThreadSortValue(b) - getThreadSortValue(a)),
                );
            } catch (err) {
                setError(err instanceof Error ? err.message : "Не удалось отправить сообщение");
            }
        },
        [selectedThread, messageDraft, selfUserId, onThreadsUpdate],
    );

    const resetDraft = useCallback(() => {
        setMessageDraft("");
    }, []);

    return {
        messages,
        initialLoading,
        loadingMore,
        error: error ?? null,
        messageDraft,
        setMessageDraft,
        isSending,
        messagesContainerRef,
        handleSendMessage,
        resetDraft,
    };
}

