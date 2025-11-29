import { API_URL, request } from "./api";

export interface ChatThreadDTO {
    id: number;
    order_id?: number | null;
    client_id?: number | null;
    client?: {
        id: number;
        email: string;
        first_name?: string | null;
        last_name?: string | null;
        full_name?: string | null;
        avatar?: string | null;
    } | null;
    translator?: {
        id: number;
        user_id: number;
        full_name: string;
        email: string;
        avatar?: string | null;
    } | null;
    last_message_text?: string | null;
    last_message_created_at?: string | null;
    last_message_sender_id?: number | null;
    last_message_sender_first_name?: string | null;
    last_message_sender_last_name?: string | null;
    last_message_type?: "text" | "system" | null;
    created_at: string;
    updated_at: string;
    unread_count?: number;
}

export interface ChatMessageDTO {
    id: number;
    thread_id: number;
    sender: number;
    sender_first_name?: string | null;
    sender_last_name?: string | null;
    sender_avatar?: string | null;
    message_type: "text" | "system";
    payload?: Record<string, unknown> | null;
    text: string;
    is_read: boolean;
    created_at: string;
    isDelivered?: boolean;
    isFailed?: boolean;
    isPending?: boolean;
    tempId?: string;
}

export interface ChatMessagesResponse {
    results: ChatMessageDTO[];
    has_more: boolean;
    next_before: string | null;
    thread_unread_count?: number;
    latest?: {
        text?: string | null;
        created_at?: string | null;
        sender_id?: number | null;
        sender_first_name?: string | null;
        sender_last_name?: string | null;
        message_type?: "text" | "system" | null;
        payload?: Record<string, unknown> | null;
    };
}

export interface ChatOrderAttachmentDTO {
    id: number;
    file: string;
    original_name: string;
    size: number;
    uploaded_by: number;
    created_at: string;
}

export type ChatOrderStatus =
    | "pending_translator"
    | "pending_client_payment"
    | "in_progress"
    | "waiting_client_approval"
    | "completed"
    | "cancelled"
    | "disputed";

export interface ChatOrderDTO {
    id: number;
    thread_id: number;
    client_id: number;
    translator_id: number;
    title: string;
    description: string;
    source_lang: { id: number; code: string; name: string; native_name?: string } | string;
    target_lang: { id: number; code: string; name: string; native_name?: string } | string;
    volume: string;
    price: string;
    currency: { id: number; code: string; name: string; symbol?: string } | string | null;
    deadline: string | null;
    status: ChatOrderStatus;
    is_paid: boolean;
    payment_status: string;
    payment_provider: string;
    payment_external_id?: string | null;
    paid_at?: string | null;
    attachments: ChatOrderAttachmentDTO[];
    created_at: string;
    updated_at: string;
}

export interface CreateChatOrderPayload {
    title: string;
    description: string;
    source_lang: number;
    target_lang: number;
    volume?: string;
    price: number;
    currency?: number | null;
    deadline?: string | null;
}

export interface RequestOrderChangePayload {
    description?: string;
    volume?: string;
    price?: number;
    currency?: number | null;
    deadline?: string | null;
}

export type FetchMessagesParams = Record<string, string | number | undefined>;

const buildQueryString = (params?: FetchMessagesParams) => {
    if (!params) return "";
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        searchParams.append(key, String(value));
    });
    const query = searchParams.toString();
    return query ? `?${query}` : "";
};

export const createThread = (translatorId: number) =>
    request<ChatThreadDTO>("/chat/threads/", {
        method: "POST",
        json: { translator_id: translatorId },
    });

export const fetchThreadMessages = async (
    threadId: number,
    params?: FetchMessagesParams,
): Promise<ChatMessagesResponse> => {
    const query = buildQueryString(params);
    const response = await request<ChatMessageDTO[] | ChatMessagesResponse>(
        `/chat/threads/${threadId}/messages/${query}`,
    );
    if (Array.isArray(response)) {
        return { results: response, has_more: false, next_before: null };
    }
    return {
        results: response.results ?? [],
        has_more: Boolean(response.has_more),
        next_before: response.next_before ?? null,
        thread_unread_count: response.thread_unread_count,
        latest: response.latest,
    };
};

export const sendThreadMessage = (threadId: number, text: string) =>
    request<ChatMessageDTO>(`/chat/threads/${threadId}/messages/`, {
        method: "POST",
        json: { text },
    });

export const markMessageStatus = (message: ChatMessageDTO, status: "sent" | "delivered" | "read" | "failed") => {
    if (status === "sent") {
        return { ...message, isPending: false, isFailed: false, isDelivered: true };
    }
    if (status === "delivered") {
        return { ...message, isDelivered: true };
    }
    if (status === "read") {
        return { ...message, is_read: true, isDelivered: true };
    }
    if (status === "failed") {
        return { ...message, isPending: false, isFailed: true };
    }
    return message;
};

export const fetchThreads = async (): Promise<ChatThreadDTO[]> => {
    const response = await request<ChatThreadDTO[] | { results: ChatThreadDTO[] }>("/chat/threads/");
    if (Array.isArray(response)) {
        return response;
    }
    return response?.results ?? [];
};

export function buildThreadWsUrl(threadId: number, token: string) {
    try {
        const apiUrl = new URL(API_URL);
        const protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
        return `${protocol}//${apiUrl.host}/ws/chat/threads/${threadId}/?token=${encodeURIComponent(token)}`;
    } catch {
        const { protocol, host } = window.location;
        const wsProtocol = protocol === "https:" ? "wss:" : "ws:";
        return `${wsProtocol}//${host}/ws/chat/threads/${threadId}/?token=${encodeURIComponent(token)}`;
    }
}

export function buildNotificationsWsUrl(token: string) {
    try {
        const apiUrl = new URL(API_URL);
        const protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
        return `${protocol}//${apiUrl.host}/ws/notifications/?token=${encodeURIComponent(token)}`;
    } catch {
        const { protocol, host } = window.location;
        const wsProtocol = protocol === "https:" ? "wss:" : "ws:";
        return `${wsProtocol}//${host}/ws/notifications/?token=${encodeURIComponent(token)}`;
    }
}

export function upsertMessage(list: ChatMessageDTO[], incoming: ChatMessageDTO) {
    const next = [...list];
    const index = next.findIndex((item) => item.id === incoming.id);
    if (index >= 0) {
        next[index] = { ...next[index], ...incoming };
        return next;
    }
    next.push(incoming);
    return next;
}

export function formatMessageTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export const fetchThreadOrders = (threadId: number) =>
    request<ChatOrderDTO[]>(`/chat/threads/${threadId}/orders/`);

export const createThreadOrder = (threadId: number, payload: CreateChatOrderPayload) =>
    request<ChatOrderDTO>(`/chat/threads/${threadId}/orders/`, {
        method: "POST",
        json: payload,
    });

export const fetchOrders = () => request<{ results: ChatOrderDTO[] } | ChatOrderDTO[]>("/chat/orders/");

export const fetchOrder = (orderId: number) => request<ChatOrderDTO>(`/chat/orders/${orderId}/`);

export const acceptOrder = (orderId: number) =>
    request<ChatOrderDTO>(`/chat/orders/${orderId}/accept/`, { method: "POST" });

export const rejectOrder = (orderId: number) =>
    request<ChatOrderDTO>(`/chat/orders/${orderId}/reject/`, { method: "POST" });

export const requestOrderChange = (orderId: number, payload: RequestOrderChangePayload) =>
    request<ChatOrderDTO>(`/chat/orders/${orderId}/request-change/`, {
        method: "POST",
        json: payload,
    });

export const markOrderPaid = (orderId: number) =>
    request<ChatOrderDTO>(`/chat/orders/${orderId}/mark-paid/`, { method: "POST" });

export const markOrderDone = (orderId: number) =>
    request<ChatOrderDTO>(`/chat/orders/${orderId}/mark-done/`, { method: "POST" });

export const approveOrder = (orderId: number) =>
    request<ChatOrderDTO>(`/chat/orders/${orderId}/approve/`, { method: "POST" });

export const disputeOrder = (orderId: number) =>
    request<ChatOrderDTO>(`/chat/orders/${orderId}/dispute/`, { method: "POST" });

export const uploadOrderAttachment = (orderId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<ChatOrderAttachmentDTO>(`/chat/orders/${orderId}/attachments/`, {
        method: "POST",
        body: formData,
    });
};


