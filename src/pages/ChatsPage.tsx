import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Paper, Stack, Typography, useMediaQuery } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import type { ChatOrderDTO } from "../utils/chat";
import { useAuthStore } from "../stores/authStore";
import { useChatNotificationStore } from "../stores/chatNotificationsStore";
import { ChatOrderDialogs } from "../components/ChatOrderDialogs";
import { useChatThreads } from "../hooks/useChatThreads";
import { useChatMessages } from "../hooks/useChatMessages";
import { useChatOrders } from "../hooks/useChatOrders";
import { ThreadsSidebar } from "../components/chat/ThreadsSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatMessagesList } from "../components/chat/ChatMessagesList";
import { ChatComposer } from "../components/chat/ChatComposer";
import { getCounterpartyInfo, type ChatMode } from "../utils/chatThreads";
import { canReviewThread } from "../utils/reviews";
import CreateReviewDialog from "../components/CreateReviewDialog";

const TITLES: Record<ChatMode, { heading: string; description: string }> = {
    translator: {
        heading: "Переписки с клиентами",
        description:
            "Отвечайте на запросы, обсуждайте детали заказов и согласовывайте условия сотрудничества в одном месте.",
    },
    client: {
        heading: "Переписки с переводчиками",
        description:
            "Обсуждайте детали будущего заказа, задавайте вопросы и договаривайтесь об условиях напрямую.",
    },
};

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

    const isMobile = useMediaQuery("(max-width:900px)");

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

    const isClientUser = mode === "client" || user?.role === "client";
    const isTranslatorUser = mode === "translator" || user?.role === "translator";

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

    const [chatError, setChatError] = useState<string | null>(null);
    const [canReview, setCanReview] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

    // mobile: режим отображения — список или чат
    const [mobileView, setMobileView] = useState<"list" | "chat">("list");

    // переключаем mobileView при наличии выбранного треда
    useEffect(() => {
        if (!isMobile) return;
        if (selectedThreadId) {
            setMobileView("chat");
        } else {
            setMobileView("list");
        }
    }, [isMobile, selectedThreadId]);

    const {
        orders,
        ordersLoading,
        orderDialogOpen,
        setOrderDialogOpen,
        orderForm,
        orderFormError,
        requestChangeOpen,
        setRequestChangeOpen,
        requestChangeTarget,
        requestChangeForm,
        activeOrderAction,
        syncOrdersFromMessages,
        resetOrderForm,
        handleOrderFormChange,
        handleCreateOrder,
        handleOrderAction,
        handleOpenRequestChange,
        handleRequestChangeField,
        handleSubmitRequestChange,
        handleUploadOrderFile,
    } = useChatOrders({
        selectedThreadId,
        onError: (error) => setChatError(error),
    });

    const {
        messages,
        initialLoading,
        loadingMore,
        error: messagesError,
        messageDraft,
        setMessageDraft,
        isSending,
        messagesContainerRef,
        handleSendMessage,
        resetDraft,
    } = useChatMessages({
        selectedThreadId,
        selectedThread,
        accessToken: accessToken ?? null,
        selfUserId,
        onThreadsUpdate: applyThreadsUpdate,
        onOrdersSync: syncOrdersFromMessages,
    });

    // Проверка возможности оставить отзыв
    useEffect(() => {
        if (!selectedThreadId || !isClientUser) {
            setCanReview(false);
            return;
        }

        if (initialLoading) return;

        let isMounted = true;
        canReviewThread(selectedThreadId)
            .then((response) => {
                if (!isMounted) return;
                setCanReview(response.can_review ?? false);
            })
            .catch(() => {
                if (!isMounted) return;
                setCanReview(false);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedThreadId, isClientUser, initialLoading]);

    useEffect(() => {
        if (messagesError !== undefined) {
            setChatError(messagesError);
        }
    }, [messagesError]);

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

    // Поддержка перехода с location.state.threadId
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

    // Если треда больше нет — чистим параметр
    useEffect(() => {
        if (!selectedThreadId || threadsLoading) return;
        const exists = threads.some((thread) => thread.id === selectedThreadId);
        if (!exists) {
            setSearchParams({}, { replace: true });
        }
    }, [selectedThreadId, threads, threadsLoading, setSearchParams]);

    // Прокидываем активный тред в стор уведомлений
    useEffect(() => {
        setActiveThread(selectedThreadId ?? null);
    }, [selectedThreadId, setActiveThread]);

    useEffect(
        () => () => {
            setActiveThread(null);
        },
        [setActiveThread],
    );

    const handleSelectThread = useCallback(
        (threadId: number) => {
            if (threadId === selectedThreadId) return;
            setChatError(null);
            resetDraft();
            applyThreadsUpdate((prev) =>
                prev.map((thread) => (thread.id === threadId ? { ...thread, unread_count: 0 } : thread)),
            );
            const params = new URLSearchParams(searchParams);
            params.set("thread", String(threadId));
            setSearchParams(params, { replace: false });

            if (isMobile) {
                setMobileView("chat");
            }
        },
        [selectedThreadId, resetDraft, applyThreadsUpdate, searchParams, setSearchParams, isMobile],
    );

    const titles = TITLES[mode];

    const showSidebar =
        !isMobile || (isMobile && mobileView === "list");
    const showChatArea =
        !isMobile || (isMobile && mobileView === "chat");

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 4 },
                py: { xs: 2, md: 3 },
                maxWidth: 1200,
                mx: "auto",
            }}
        >
            <Stack
                spacing={2}
                sx={{
                    height: {
                        xs: "calc(100vh - 120px)",
                        md: "calc(100vh - 160px)",
                    },
                }}
            >
                {/* Шапка страницы */}
                <Box sx={{ mb: 0.5 }}>
                    <Typography variant="h5" fontWeight={800}>
                        {titles.heading}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, maxWidth: 640 }}
                    >
                        {titles.description}
                    </Typography>
                </Box>

                {/* Основной блок чатов */}
                <Paper
                    elevation={0}
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        flex: 1,
                        minHeight: 0,
                        overflow: "hidden",
                        bgcolor: "background.paper",
                        p: 0
                    }}
                >
                    {showSidebar && (
                        <ThreadsSidebar
                            threads={threads}
                            loading={threadsLoading}
                            error={threadsError}
                            selectedThreadId={selectedThreadId}
                            onSelect={handleSelectThread}
                            mode={mode}
                            selfUserId={selfUserId ?? undefined}
                        />
                    )}

                    {showChatArea && (
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
                                        canReview={canReview}
                                        onOpenOrderDialog={() => {
                                            resetOrderForm();
                                            setOrderDialogOpen(true);
                                        }}
                                        onOpenReviewDialog={() => setReviewDialogOpen(true)}
                                        showBackButton={isMobile}
                                        onBack={() => setMobileView("list")}
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

                                    <ChatComposer
                                        value={messageDraft}
                                        onChange={setMessageDraft}
                                        onSubmit={handleSendMessage}
                                        disabled={initialLoading || isSending}
                                    />
                                </>
                            ) : (
                                !isMobile && (
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
                                            Чтобы просмотреть переписку и отправить сообщение,
                                            выберите чат из списка слева.
                                        </Typography>
                                    </Stack>
                                )
                            )}
                        </Box>
                    )}
                </Paper>
            </Stack>

            {/* Диалоги заказов и отзывов */}
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

            {selectedThreadId && (
                <CreateReviewDialog
                    open={reviewDialogOpen}
                    onClose={() => setReviewDialogOpen(false)}
                    onSuccess={() => {
                        setCanReview(false);
                    }}
                    threadId={selectedThreadId}
                />
            )}
        </Box>
    );
}
