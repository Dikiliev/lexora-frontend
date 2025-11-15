import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import type {
    ChatMessageDTO,
    ChatOrderDTO,
    ChatMessagesResponse,
    CreateChatOrderPayload,
    RequestOrderChangePayload,
} from "../utils/chat";
import {
    acceptOrder,
    approveOrder,
    buildThreadWsUrl,
    createThreadOrder,
    disputeOrder,
    fetchThreadMessages,
    fetchThreadOrders,
    markOrderDone,
    markOrderPaid,
    rejectOrder,
    requestOrderChange,
    sendThreadMessage,
    upsertMessage,
    uploadOrderAttachment,
} from "../utils/chat";
import { useAuthStore } from "../stores/authStore";
import { useChatNotificationStore } from "../stores/chatNotificationsStore";
import type { ChatOrderAction } from "../components/ChatOrderCard";
import { ChatOrderDialogs, type OrderFormState, type RequestChangeFormState } from "../components/ChatOrderDialogs";
import { useChatThreads } from "../hooks/useChatThreads";
import { ThreadsSidebar } from "../components/chat/ThreadsSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatMessagesList } from "../components/chat/ChatMessagesList";
import { ChatComposer } from "../components/chat/ChatComposer";
import { getCounterpartyInfo, getThreadSortValue, type ChatMode } from "../utils/chatThreads";

const TITLES: Record<ChatMode, { heading: string; description: string }> = {
    translator: {
        heading: "Переписки с клиентами",
        description:
            "Отвечайте клиентам, обсуждайте детали заказов и согласовывайте условия сотрудничества.",
    },
    client: {
        heading: "Переписки с переводчиками",
        description:
            "Свяжитесь с переводчиками, задавайте вопросы и обсуждайте детали будущего заказа.",
    },
};

const MESSAGES_PAGE_SIZE = 20;

interface ChatsPageProps {
    mode: ChatMode;
}

export default function ChatsPage({ mode }: ChatsPageProps) {
    const user = useAuthStore((state) => state.user);
    const accessToken = useAuthStore((state) => state.accessToken);
    const setActiveThread = useChatNotificationStore((state) => state.setActiveThread);
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const {
        threads,
        loading: threadsLoading,
        error: threadsError,
        applyUpdate: applyThreadsUpdate,
    } = useChatThreads();
    const threadParam = searchParams.get("thread");
    const selectedThreadId = useMemo(() => {
        if (!threadParam) return null;
        const parsed = Number(threadParam);
        return Number.isFinite(parsed) ? parsed : null;
    }, [threadParam]);
    const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
    const [initialLoading, setInitialLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [chatError, setChatError] = useState<string | null>(null);
    const [messageDraft, setMessageDraft] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
    const [orders, setOrders] = useState<ChatOrderDTO[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [orderForm, setOrderForm] = useState<OrderFormState>({
        title: "",
        description: "",
        source_lang: "",
        target_lang: "",
        volume: "",
        price: "",
        currency: "RUB",
        deadline: "",
    });
    const [orderFormError, setOrderFormError] = useState<string | null>(null);
    const [requestChangeOpen, setRequestChangeOpen] = useState(false);
    const [requestChangeTarget, setRequestChangeTarget] = useState<ChatOrderDTO | null>(null);
    const [requestChangeForm, setRequestChangeForm] = useState<RequestChangeFormState>({
        description: "",
        volume: "",
        price: "",
        currency: "",
        deadline: "",
    });
    const [activeOrderAction, setActiveOrderAction] = useState<Record<number, ChatOrderAction | "upload" | null>>({});
    const isClientUser = mode === "client" || user?.role === "client";
    const isTranslatorUser = mode === "translator" || user?.role === "translator";
    const tempIdRef = useRef(0);
    const socketRef = useRef<WebSocket | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const upsertOrder = useCallback((nextOrder: ChatOrderDTO) => {
        setOrders((prev) => {
            const index = prev.findIndex((item) => item.id === nextOrder.id);
            if (index >= 0) {
                const copy = [...prev];
                copy[index] = nextOrder;
                return copy;
            }
            return [nextOrder, ...prev];
        });
    }, []);

    const syncOrdersFromMessages = useCallback(
        (list: ChatMessageDTO[]) => {
            list.forEach((message) => {
                const payload = message.payload as { order?: ChatOrderDTO } | undefined;
                if (message.message_type === "system" && payload?.order) {
                    upsertOrder(payload.order);
                }
            });
        },
        [upsertOrder],
    );


    const selectedThread = useMemo(
        () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
        [threads, selectedThreadId],
    );
    const counterparty = useMemo(
        () => (selectedThread ? getCounterpartyInfo(selectedThread, mode) : null),
        [selectedThread, mode],
    );
    const selfUserId = useMemo(() => {
        if (!selectedThread) return user?.id;
        if (mode === "translator") {
            return selectedThread.translator?.user_id ?? user?.id;
        }
        if (mode === "client") {
            return selectedThread.client_id ?? selectedThread.client?.id ?? user?.id;
        }
        return user?.id;
    }, [selectedThread, mode, user?.id]);

    const resolveOrderRoles = useCallback(
        (order: ChatOrderDTO) => {
            const normalizeId = (value: unknown) => {
                if (value === undefined || value === null) return null;
                const num = Number(value);
                return Number.isFinite(num) ? num : null;
            };
            const threadClientUserId = normalizeId(selectedThread?.client_id ?? selectedThread?.client?.id);
            const threadTranslatorUserId = normalizeId(selectedThread?.translator?.user_id);
            const orderClientUserId = normalizeId(order.client_id ?? threadClientUserId);
            const orderTranslatorUserId = normalizeId(order.translator_id ?? threadTranslatorUserId);
            const viewerId = normalizeId(user?.id);
            return {
                isClient:
                    Boolean(isClientUser) &&
                    (orderClientUserId === null || (viewerId !== null && viewerId === orderClientUserId)),
                isTranslator:
                    Boolean(isTranslatorUser) &&
                    (orderTranslatorUserId === null || (viewerId !== null && viewerId === orderTranslatorUserId)),
            };
        },
        [isClientUser, isTranslatorUser, user?.id, selectedThread],
    );

    useEffect(() => {
        const state = (location.state as { threadId?: number } | null) ?? null;
        if (state?.threadId) {
            const params = new URLSearchParams();
            params.set("thread", String(state.threadId));
            navigate(
                {
                    pathname: location.pathname,
                    search: `?${params.toString()}`,
                },
                { replace: true, state: null },
            );
        }
    }, [location, navigate]);

    useEffect(() => {
        if (!selectedThreadId || threadsLoading) return;
        const exists = threads.some((thread) => thread.id === selectedThreadId);
        if (!exists) {
            setSearchParams({}, { replace: true });
        }
    }, [selectedThreadId, threads, threadsLoading, setSearchParams]);

    useEffect(() => {
        setActiveThread(selectedThreadId ?? null);
    }, [selectedThreadId, setActiveThread]);

    useEffect(
        () => () => {
            setActiveThread(null);
        },
        [setActiveThread],
    );

    useEffect(() => {
        if (!selectedThreadId) {
            setOrders([]);
            setOrdersLoading(false);
            return;
        }
        setOrdersLoading(true);
        fetchThreadOrders(selectedThreadId)
            .then((data) => setOrders(data))
            .catch((error) => console.error("Не удалось загрузить заказы", error))
            .finally(() => setOrdersLoading(false));
    }, [selectedThreadId]);

    const loadMessages = useCallback(
        async (
            threadId: number,
            { before, append }: { before?: string | null; append?: boolean } = {},
        ) => {
            const params: Record<string, string | number | undefined> = { limit: MESSAGES_PAGE_SIZE };
            if (before) {
                params.before = before;
            }

            setChatError(null);

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
            syncOrdersFromMessages(normalizedPage);
            setNextCursor(response.next_before ?? null);
            setHasMore(Boolean(response.has_more));
            const updateLatest = !append && response.latest;

            applyThreadsUpdate((prev) =>
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
        [applyThreadsUpdate, syncOrdersFromMessages],
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
        setChatError(null);
        setMessages([]);
        setHasMore(false);
        setNextCursor(null);

        loadMessages(selectedThreadId)
            .catch((err) => {
                setChatError(err instanceof Error ? err.message : "Не удалось загрузить сообщения");
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
            return;
        }

        const wsUrl = buildThreadWsUrl(selectedThreadId, accessToken);
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
                        sender_first_name: data.sender_first_name,
                        sender_last_name: data.sender_last_name,
                        text: data.text,
                        message_type: data.message_type ?? "text",
                        payload: data.payload ?? null,
                        is_read: Boolean(data.is_read),
                        created_at: data.created_at,
                        isDelivered: true,
                    };
                    applyThreadsUpdate((prev) =>
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
                        const orderPayload = (nextMessage.payload as { order?: ChatOrderDTO } | undefined)?.order;
                        if (orderPayload) {
                            upsertOrder(orderPayload);
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
                        applyThreadsUpdate((prev) =>
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

                    applyThreadsUpdate((prev) =>
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

        socket.onerror = () => {
            setChatError("Не удалось установить WebSocket-соединение");
        };

        return () => {
            socketRef.current = null;
            socket.close();
        };
    }, [selectedThreadId, accessToken, applyThreadsUpdate, selfUserId, upsertOrder]);

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
                        setChatError(err instanceof Error ? err.message : "Не удалось загрузить сообщения");
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

    const handleSelectThread = (threadId: number) => {
        if (threadId === selectedThreadId) return;
        setChatError(null);
        setMessageDraft("");
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        applyThreadsUpdate((prev) =>
            prev.map((thread) => (thread.id === threadId ? { ...thread, unread_count: 0 } : thread)),
        );
        const params = new URLSearchParams(searchParams);
        params.set("thread", String(threadId));
        setSearchParams(params, { replace: false });
    };

    const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedThread) return;
        const text = messageDraft.trim();
        if (!text) return;
        setChatError(null);

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
                sender_first_name: user?.first_name ?? "",
                sender_last_name: user?.last_name ?? "",
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
            applyThreadsUpdate((prev) =>
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
            setChatError(err instanceof Error ? err.message : "Не удалось отправить сообщение");
        }
    };

    const resetOrderForm = () =>
        setOrderForm({
            title: "",
            description: "",
            source_lang: "",
            target_lang: "",
            volume: "",
            price: "",
            currency: "RUB",
            deadline: "",
        });

    const handleOrderFormChange = (field: keyof OrderFormState) => (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setOrderForm((prev: OrderFormState) => ({ ...prev, [field]: value }));
    };

    const handleCreateOrder = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedThreadId) return;
        setOrderFormError(null);
        try {
            const payload: CreateChatOrderPayload = {
                title: orderForm.title.trim(),
                description: orderForm.description.trim(),
                source_lang: orderForm.source_lang.trim(),
                target_lang: orderForm.target_lang.trim(),
                volume: orderForm.volume.trim(),
                price: Number(orderForm.price),
                currency: orderForm.currency || "RUB",
                deadline: orderForm.deadline ? new Date(orderForm.deadline).toISOString() : null,
            };
            const created = await createThreadOrder(selectedThreadId, payload);
            upsertOrder(created);
            setOrderDialogOpen(false);
            resetOrderForm();
        } catch (error) {
            setOrderFormError(error instanceof Error ? error.message : "Не удалось создать заказ");
        }
    };

    const handleOrderAction = async (order: ChatOrderDTO, action: ChatOrderAction) => {
        if (action === "request-change") {
            handleOpenRequestChange(order);
            return;
        }
        setActiveOrderAction((prev) => ({ ...prev, [order.id]: action }));
        try {
            let updated: ChatOrderDTO | null = null;
            switch (action) {
                case "accept":
                    updated = await acceptOrder(order.id);
                    break;
                case "reject":
                    updated = await rejectOrder(order.id);
                    break;
                case "mark-paid":
                    updated = await markOrderPaid(order.id);
                    break;
                case "mark-done":
                    updated = await markOrderDone(order.id);
                    break;
                case "approve":
                    updated = await approveOrder(order.id);
                    break;
                case "dispute":
                    updated = await disputeOrder(order.id);
                    break;
                default:
                    break;
            }
            if (updated) {
                upsertOrder(updated);
            }
        } catch (error) {
            setChatError(error instanceof Error ? error.message : "Не удалось выполнить действие с заказом");
        } finally {
            setActiveOrderAction((prev) => ({ ...prev, [order.id]: null }));
        }
    };

    const handleOpenRequestChange = (order: ChatOrderDTO) => {
        setRequestChangeTarget(order);
        setRequestChangeForm({
            description: order.description,
            volume: order.volume ?? "",
            price: order.price,
            currency: order.currency,
            deadline: order.deadline ? new Date(order.deadline).toISOString().slice(0, 16) : "",
        });
        setRequestChangeOpen(true);
    };

    const handleRequestChangeField =
        (field: keyof RequestChangeFormState) => (event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            setRequestChangeForm((prev: RequestChangeFormState) => ({ ...prev, [field]: value }));
        };

    const handleSubmitRequestChange = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!requestChangeTarget) return;
        const targetId = requestChangeTarget.id;
        setActiveOrderAction((prev) => ({ ...prev, [targetId]: "request-change" }));
        try {
            const payload: RequestOrderChangePayload = {};
            if (requestChangeForm.description) payload.description = requestChangeForm.description;
            if (requestChangeForm.volume) payload.volume = requestChangeForm.volume;
            if (requestChangeForm.price) payload.price = Number(requestChangeForm.price);
            if (requestChangeForm.currency) payload.currency = requestChangeForm.currency;
            if (requestChangeForm.deadline) {
                payload.deadline = new Date(requestChangeForm.deadline).toISOString();
            }
            const updated = await requestOrderChange(requestChangeTarget.id, payload);
            upsertOrder(updated);
            setRequestChangeOpen(false);
            setRequestChangeTarget(null);
            setRequestChangeForm({
                description: "",
                volume: "",
                price: "",
                currency: "",
                deadline: "",
            });
        } catch (error) {
            setChatError(error instanceof Error ? error.message : "Не удалось обновить заказ");
        } finally {
            setActiveOrderAction((prev) => ({ ...prev, [targetId]: null }));
        }
    };

    const handleUploadOrderFile = async (order: ChatOrderDTO, file: File) => {
        setActiveOrderAction((prev) => ({ ...prev, [order.id]: "upload" }));
        try {
            const attachment = await uploadOrderAttachment(order.id, file);
            setOrders((prev) =>
                prev.map((item) =>
                    item.id === order.id ? { ...item, attachments: [attachment, ...(item.attachments ?? [])] } : item,
                ),
            );
        } catch (error) {
            setChatError(error instanceof Error ? error.message : "Не удалось загрузить файл");
        } finally {
            setActiveOrderAction((prev) => ({ ...prev, [order.id]: null }));
        }
    };

    const titles = TITLES[mode];

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
            <Stack spacing={3} sx={{ height: { md: "calc(100vh - 180px)" } }}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        {titles.heading}
                    </Typography>
                    <Typography color="text.secondary">{titles.description}</Typography>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        height: { xs: 520, sm: 560, md: "100%" },
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                        minHeight: 360,
                    }}
                >
                    <ThreadsSidebar
                        threads={threads}
                        loading={threadsLoading}
                        error={threadsError}
                        selectedThreadId={selectedThreadId}
                        onSelect={handleSelectThread}
                        mode={mode}
                        selfUserId={selfUserId ?? undefined}
                    />

                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                        }}
                    >
                        {selectedThread ? (
                            <>
                                <ChatHeader
                                    counterparty={counterparty}
                                    selectedThread={selectedThread}
                                    isClient={isClientUser}
                                    onOpenOrderDialog={() => {
                                        resetOrderForm();
                                        setOrderFormError(null);
                                        setOrderDialogOpen(true);
                                    }}
                                />

                                <ChatMessagesList
                                    containerRef={messagesContainerRef}
                                    messages={messages}
                                    counterpartyTitle={counterparty?.title ?? null}
                                    selfUserId={selfUserId ?? undefined}
                                    initialLoading={initialLoading}
                                    ordersLoading={ordersLoading}
                                    incrementalLoading={loadingMore}
                                    error={chatError}
                                    orders={orders}
                                    resolveOrderRoles={resolveOrderRoles}
                                    activeOrderAction={activeOrderAction}
                                    onOrderAction={handleOrderAction}
                                    onRequestChange={handleOpenRequestChange}
                                    onUploadFile={handleUploadOrderFile}
                                />

                                <Divider />

                                <ChatComposer
                                    value={messageDraft}
                                    onChange={setMessageDraft}
                                    onSubmit={handleSendMessage}
                                    disabled={initialLoading || isSending}
                                />
                            </>
                        ) : (
                            <Stack
                                spacing={1.5}
                                alignItems="center"
                                justifyContent="center"
                                sx={{ flex: 1, textAlign: "center", p: 4 }}
                            >
                                <Typography variant="h6" fontWeight={700}>
                                    Выберите чат
                                </Typography>
                                <Typography color="text.secondary">
                                    Чтобы просмотреть переписку и отправить сообщение, выберите чат из списка.
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </Paper>
            </Stack>
            <ChatOrderDialogs
                isClient={isClientUser}
                createDialog={{
                    open: orderDialogOpen,
                    form: orderForm,
                    error: orderFormError,
                    onClose: () => setOrderDialogOpen(false),
                    onSubmit: handleCreateOrder,
                    onChange: handleOrderFormChange,
                }}
                requestChangeDialog={{
                    open: requestChangeOpen,
                    form: requestChangeForm,
                    canSubmit: Boolean(requestChangeTarget),
                    onClose: () => setRequestChangeOpen(false),
                    onSubmit: handleSubmitRequestChange,
                    onChange: handleRequestChangeField,
                }}
            />
        </Box>
    );
}

