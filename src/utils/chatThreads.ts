import type { ChatThreadDTO } from "./chat";

export type ChatMode = "translator" | "client";

export interface CounterpartyInfo {
    title: string;
    avatar: string;
}

function toTimestamp(value?: string | null) {
    if (!value) return 0;
    const ts = new Date(value).getTime();
    return Number.isFinite(ts) ? ts : 0;
}

export function getThreadSortValue(thread: ChatThreadDTO) {
    return toTimestamp(thread.last_message_created_at ?? thread.updated_at);
}

export function buildThreadMeta(thread: ChatThreadDTO) {
    return {
        threadId: thread.id,
        last_message_text: thread.last_message_text ?? undefined,
        last_message_created_at: thread.last_message_created_at ?? undefined,
        last_message_sender_id: thread.last_message_sender_id ?? undefined,
        last_message_sender_first_name: thread.last_message_sender_first_name ?? undefined,
        last_message_sender_last_name: thread.last_message_sender_last_name ?? undefined,
        unread_count: thread.unread_count ?? 0,
        updated_at: thread.last_message_created_at ?? thread.updated_at ?? null,
    };
}

function getInitials(value: string | null | undefined, fallback: string) {
    if (!value) return fallback;
    const parts = value.trim().split(/\s+/);
    if (parts.length === 0) return fallback;
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? fallback;
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function getCounterpartyInfo(thread: ChatThreadDTO, mode: ChatMode): CounterpartyInfo {
    if (mode === "translator") {
        const clientName =
            [thread.client?.first_name, thread.client?.last_name]
                .filter(Boolean)
                .join(" ")
                .trim() || thread.client?.full_name || thread.client?.email || (thread.client_id ? `Клиент #${thread.client_id}` : null);
        return {
            title: clientName ?? `Чат #${thread.id}`,
            avatar: getInitials(clientName, "К"),
        };
    }

    const translatorName =
        thread.translator?.full_name?.trim() ||
        thread.translator?.email ||
        (thread.translator?.user_id ? `Переводчик #${thread.translator.user_id}` : null);
    return {
        title: translatorName ?? `Чат #${thread.id}`,
        avatar: getInitials(translatorName, "П"),
    };
}

export function getThreadPreview(
    thread: ChatThreadDTO,
    mode: ChatMode,
    selfUserId?: number,
): { timeLabel?: string; textLabel: string } {
    const timeLabel = thread.last_message_created_at
        ? new Date(thread.last_message_created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
        : undefined;
    const senderId = thread.last_message_sender_id ?? null;
    const isOwn = selfUserId !== undefined && senderId === selfUserId;
    const senderName = isOwn
        ? "Вы"
        : [thread.last_message_sender_first_name, thread.last_message_sender_last_name]
              .filter(Boolean)
              .join(" ") ||
          (mode === "translator" ? "Клиент" : "Переводчик");
    const text = thread.last_message_text?.trim();
    if (!text) {
        return { timeLabel, textLabel: "Пока нет сообщений" };
    }
    return {
        timeLabel,
        textLabel: `${senderName}: ${text}`,
    };
}

