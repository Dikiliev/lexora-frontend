import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import type { ChatMessageDTO, ChatOrderDTO, CreateChatOrderPayload, RequestOrderChangePayload } from "../utils/chat";
import {
    acceptOrder,
    approveOrder,
    createThreadOrder,
    disputeOrder,
    fetchThreadOrders,
    markOrderDone,
    markOrderPaid,
    rejectOrder,
    requestOrderChange,
    uploadOrderAttachment,
} from "../utils/chat";
import type { ChatOrderAction } from "../components/ChatOrderCard";
import type { OrderFormState, RequestChangeFormState } from "../components/ChatOrderDialogs";

interface UseChatOrdersOptions {
    selectedThreadId: number | null;
    onError?: (error: string) => void;
}

export function useChatOrders({ selectedThreadId, onError }: UseChatOrdersOptions) {
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

    useEffect(() => {
        if (!selectedThreadId) {
            setOrders([]);
            setOrdersLoading(false);
            return;
        }
        setOrdersLoading(true);
        fetchThreadOrders(selectedThreadId)
            .then((data) => setOrders(data))
            .catch((error) => {
                console.error("Не удалось загрузить заказы", error);
                onError?.(error instanceof Error ? error.message : "Не удалось загрузить заказы");
            })
            .finally(() => setOrdersLoading(false));
    }, [selectedThreadId, onError]);

    const resetOrderForm = useCallback(
        () =>
            setOrderForm({
                title: "",
                description: "",
                source_lang: "",
                target_lang: "",
                volume: "",
                price: "",
                currency: "RUB",
                deadline: "",
            }),
        [],
    );

    const handleOrderFormChange = useCallback(
        (field: keyof OrderFormState) => (event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            setOrderForm((prev: OrderFormState) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const handleCreateOrder = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
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
        },
        [selectedThreadId, orderForm, upsertOrder, resetOrderForm],
    );

    const handleOrderAction = useCallback(
        async (order: ChatOrderDTO, action: ChatOrderAction) => {
            if (action === "request-change") {
                setRequestChangeTarget(order);
                setRequestChangeForm({
                    description: order.description,
                    volume: order.volume ?? "",
                    price: order.price,
                    currency: order.currency,
                    deadline: order.deadline ? new Date(order.deadline).toISOString().slice(0, 16) : "",
                });
                setRequestChangeOpen(true);
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
                onError?.(error instanceof Error ? error.message : "Не удалось выполнить действие с заказом");
            } finally {
                setActiveOrderAction((prev) => ({ ...prev, [order.id]: null }));
            }
        },
        [upsertOrder, onError],
    );

    const handleOpenRequestChange = useCallback((order: ChatOrderDTO) => {
        setRequestChangeTarget(order);
        setRequestChangeForm({
            description: order.description,
            volume: order.volume ?? "",
            price: order.price,
            currency: order.currency,
            deadline: order.deadline ? new Date(order.deadline).toISOString().slice(0, 16) : "",
        });
        setRequestChangeOpen(true);
    }, []);

    const handleRequestChangeField = useCallback(
        (field: keyof RequestChangeFormState) => (event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            setRequestChangeForm((prev: RequestChangeFormState) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const handleSubmitRequestChange = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
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
                onError?.(error instanceof Error ? error.message : "Не удалось обновить заказ");
            } finally {
                setActiveOrderAction((prev) => ({ ...prev, [targetId]: null }));
            }
        },
        [requestChangeTarget, requestChangeForm, upsertOrder, onError],
    );

    const handleUploadOrderFile = useCallback(
        async (order: ChatOrderDTO, file: File) => {
            setActiveOrderAction((prev) => ({ ...prev, [order.id]: "upload" }));
            try {
                const attachment = await uploadOrderAttachment(order.id, file);
                setOrders((prev) =>
                    prev.map((item) =>
                        item.id === order.id ? { ...item, attachments: [attachment, ...(item.attachments ?? [])] } : item,
                    ),
                );
            } catch (error) {
                onError?.(error instanceof Error ? error.message : "Не удалось загрузить файл");
            } finally {
                setActiveOrderAction((prev) => ({ ...prev, [order.id]: null }));
            }
        },
        [onError],
    );

    return {
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
    };
}

