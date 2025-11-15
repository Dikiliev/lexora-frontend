import { useCallback, useEffect, useRef, useState } from "react";

import type { ChatThreadDTO } from "../utils/chat";
import { fetchThreads } from "../utils/chat";
import { useChatNotificationStore } from "../stores/chatNotificationsStore";
import { buildThreadMeta, getThreadSortValue } from "../utils/chatThreads";

export function useChatThreads() {
    const [threads, setThreads] = useState<ChatThreadDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const syncThreadsMeta = useChatNotificationStore((state) => state.syncThreadsMeta);
    const queuedUpdates = useChatNotificationStore((state) => state.queuedUpdates);
    const drainThreadUpdates = useChatNotificationStore((state) => state.drainThreadUpdates);
    const isMountedRef = useRef(true);

    const applyUpdate = useCallback(
        (updater: (prev: ChatThreadDTO[]) => ChatThreadDTO[]) => {
            setThreads((prev) => {
                const next = updater(prev);
                syncThreadsMeta(next.map(buildThreadMeta));
                return next;
            });
        },
        [syncThreadsMeta],
    );

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchThreads();
            if (!isMountedRef.current) return;
            const sorted = [...data].sort((a, b) => getThreadSortValue(b) - getThreadSortValue(a));
            setThreads(sorted);
            syncThreadsMeta(sorted.map(buildThreadMeta));
            setError(null);
        } catch (err) {
            if (!isMountedRef.current) return;
            setError(err instanceof Error ? err.message : "Не удалось загрузить список чатов");
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [syncThreadsMeta]);

    useEffect(() => {
        isMountedRef.current = true;
        void refresh();
        return () => {
            isMountedRef.current = false;
        };
    }, [refresh]);

    useEffect(() => {
        if (!queuedUpdates.length) return;
        const updates = drainThreadUpdates();
        if (!updates.length) return;

        applyUpdate((prev) => {
            const map = new Map(prev.map((thread) => [thread.id, { ...thread }]));
            for (const update of updates) {
                if (!update?.threadId) continue;
                const thread = map.get(update.threadId);
                if (!thread) continue;
                Object.assign(thread, {
                    last_message_text: update.last_message_text ?? thread.last_message_text,
                    last_message_created_at: update.last_message_created_at ?? thread.last_message_created_at,
                    last_message_sender_id: update.last_message_sender_id ?? thread.last_message_sender_id,
                    last_message_sender_first_name:
                        update.last_message_sender_first_name ?? thread.last_message_sender_first_name,
                    last_message_sender_last_name:
                        update.last_message_sender_last_name ?? thread.last_message_sender_last_name,
                    unread_count: update.unread_count ?? thread.unread_count,
                    updated_at: update.updated_at ?? thread.updated_at,
                });
            }
            return Array.from(map.values()).sort((a, b) => getThreadSortValue(b) - getThreadSortValue(a));
        });
    }, [queuedUpdates, drainThreadUpdates, applyUpdate]);

    return {
        threads,
        loading,
        error,
        applyUpdate,
        refresh,
        setError,
        setLoading,
    };
}

