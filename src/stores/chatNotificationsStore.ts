import { create } from "zustand";

type NotificationPayload = {
    threadId: number;
    message: string;
    senderId?: number | null;
};

type ThreadUpdatePayload = {
    threadId: number;
    last_message_text?: string;
    last_message_created_at?: string;
    last_message_sender_id?: number;
    last_message_sender_first_name?: string;
    last_message_sender_last_name?: string;
    unread_count?: number;
    updated_at?: string | null;
};

type ThreadMetaMap = Record<number, ThreadUpdatePayload>;

function computeTotalUnread(meta: ThreadMetaMap): number {
    return Object.values(meta).reduce((total, item) => total + (item.unread_count ?? 0), 0);
}

export type ChatNotificationState = {
    open: boolean;
    message: string;
    threadId: number | null;
    senderId?: number | null;
    activeThreadId: number | null;
    totalUnread: number;
    queuedUpdates: ThreadUpdatePayload[];
    threadMeta: ThreadMetaMap;
    show: (payload: NotificationPayload) => void;
    hide: () => void;
    setActiveThread: (threadId: number | null) => void;
    enqueueThreadUpdate: (payload: ThreadUpdatePayload) => void;
    drainThreadUpdates: () => ThreadUpdatePayload[];
    syncThreadsMeta: (threads: ThreadUpdatePayload[]) => void;
};

export const useChatNotificationStore = create<ChatNotificationState>((set, get) => ({
    open: false,
    message: "",
    threadId: null,
    senderId: null,
    activeThreadId: null,
    totalUnread: 0,
    queuedUpdates: [],
    threadMeta: {},
    show: ({ threadId, message, senderId }) =>
        set((state) => {
            if (!threadId) {
                return state;
            }
            const text = message.trim();
            if (!text) {
                return state;
            }
            if (state.activeThreadId === threadId) {
                return state;
            }
            if (state.open && state.threadId === threadId && state.message === text) {
                return state;
            }
            return {
                ...state,
                open: true,
                message: text,
                threadId,
                senderId: senderId ?? null,
            };
        }),
    hide: () =>
        set((state) =>
            state.open
                ? {
                      ...state,
                      open: false,
                      message: "",
                      threadId: null,
                      senderId: null,
                  }
                : state,
        ),
    setActiveThread: (threadId) => {
        set((state) => {
            if (state.activeThreadId === threadId) {
                return state;
            }
            if (threadId === null) {
                return {
                    ...state,
                    activeThreadId: null,
                };
            }
            const existing = state.threadMeta[threadId];
            if (!existing || (existing.unread_count ?? 0) === 0) {
                return {
                    ...state,
                    activeThreadId: threadId,
                };
            }
            const nextMeta: ThreadMetaMap = {
                ...state.threadMeta,
                [threadId]: {
                    ...existing,
                    unread_count: 0,
                },
            };
            return {
                ...state,
                activeThreadId: threadId,
                threadMeta: nextMeta,
                totalUnread: computeTotalUnread(nextMeta),
            };
        });
    },
    enqueueThreadUpdate: (payload) => {
        if (!payload?.threadId) {
            return;
        }
        set((state) => {
            const nextMeta: ThreadMetaMap = {
                ...state.threadMeta,
                [payload.threadId]: {
                    ...(state.threadMeta[payload.threadId] ?? {}),
                    ...payload,
                },
            };
            const nextUpdates = [...state.queuedUpdates, payload];
            return {
                ...state,
                threadMeta: nextMeta,
                queuedUpdates: nextUpdates,
                totalUnread: computeTotalUnread(nextMeta),
            };
        });
    },
    drainThreadUpdates: () => {
        const updates = get().queuedUpdates;
        if (!updates.length) {
            return [];
        }
        set((state) => ({
            ...state,
            queuedUpdates: [],
        }));
        return updates;
    },
    syncThreadsMeta: (threads) => {
        const nextMeta: ThreadMetaMap = {};
        for (const thread of threads) {
            if (!thread?.threadId) {
                continue;
            }
            nextMeta[thread.threadId] = {
                ...nextMeta[thread.threadId],
                ...thread,
                unread_count: Math.max(thread.unread_count ?? 0, 0),
            };
        }
        set((state) => ({
            ...state,
            threadMeta: nextMeta,
            totalUnread: computeTotalUnread(nextMeta),
        }));
    },
}));

