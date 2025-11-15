import {
    Alert,
    Avatar,
    Badge,
    Box,
    CircularProgress,
    Divider,
    List,
    ListItemButton,
    Stack,
    Typography,
} from "@mui/material";

import type { ChatThreadDTO } from "../../utils/chat";
import type { ChatMode } from "../../utils/chatThreads";
import { getCounterpartyInfo, getThreadPreview } from "../../utils/chatThreads";

interface ThreadsSidebarProps {
    threads: ChatThreadDTO[];
    loading: boolean;
    error: string | null;
    selectedThreadId: number | null;
    onSelect: (threadId: number) => void;
    mode: ChatMode;
    selfUserId?: number;
}

export function ThreadsSidebar({
    threads,
    loading,
    error,
    selectedThreadId,
    onSelect,
    mode,
    selfUserId,
}: ThreadsSidebarProps) {
    return (
        <Stack
            sx={{
                width: { xs: "100%", md: 320 },
                borderBottom: { xs: "1px solid", md: "none" },
                borderRight: { xs: "none", md: "1px solid" },
                borderColor: "divider",
                flexShrink: 0,
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                    Чаты
                </Typography>
            </Box>
            <Divider />
            <Box sx={{ flex: 1, overflowY: "auto" }}>
                {loading ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} />
                    </Stack>
                ) : error ? (
                    <Alert severity="error" sx={{ m: 2 }}>
                        {error}
                    </Alert>
                ) : threads.length === 0 ? (
                    <Typography color="text.secondary" sx={{ px: 2, py: 3 }}>
                        Пока нет активных чатов. Как только вам напишут, они появятся здесь.
                    </Typography>
                ) : (
                    <List disablePadding>
                        {threads.map((thread) => {
                            const info = getCounterpartyInfo(thread, mode);
                            const preview = getThreadPreview(thread, mode, selfUserId);
                            const isSelected = thread.id === selectedThreadId;
                            return (
                                <ListItemButton
                                    key={thread.id}
                                    selected={isSelected}
                                    alignItems="flex-start"
                                    onClick={() => onSelect(thread.id)}
                                    sx={{
                                        py: 1.5,
                                        px: 2,
                                        gap: 2,
                                        borderLeft: isSelected ? "4px solid" : "4px solid transparent",
                                        borderColor: isSelected ? "primary.main" : "transparent",
                                    }}
                                >
                                    <Badge
                                        color="primary"
                                        badgeContent={thread.unread_count || 0}
                                        invisible={!thread.unread_count}
                                        overlap="circular"
                                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                    >
                                        <Avatar sx={{ width: 40, height: 40 }}>{info.avatar}</Avatar>
                                    </Badge>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                                                {info.title}
                                            </Typography>
                                            {preview.timeLabel && (
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {preview.timeLabel}
                                                </Typography>
                                            )}
                                        </Stack>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            noWrap
                                            sx={{ mt: 0.5 }}
                                        >
                                            {preview.textLabel}
                                        </Typography>
                                    </Box>
                                </ListItemButton>
                            );
                        })}
                    </List>
                )}
            </Box>
        </Stack>
    );
}

