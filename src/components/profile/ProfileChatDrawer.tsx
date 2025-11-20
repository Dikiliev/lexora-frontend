import {
    Alert,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    Stack,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import type { FormEvent } from "react";
import type { ChatMessageDTO } from "../../utils/chat";
import { formatMessageTime } from "../../utils/chat";

interface ProfileChatDrawerProps {
    open: boolean;
    onClose: () => void;
    translatorName: string;
    messages: ChatMessageDTO[];
    messageDraft: string;
    onMessageDraftChange: (value: string) => void;
    onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
    chatLoading: boolean;
    historyLoading: boolean;
    chatError: string | null;
    isSending: boolean;
    userId: number | undefined;
    bottomRef: React.RefObject<HTMLDivElement | null>;
}

export function ProfileChatDrawer({
    open,
    onClose,
    translatorName,
    messages,
    messageDraft,
    onMessageDraftChange,
    onSendMessage,
    chatLoading,
    historyLoading,
    chatError,
    isSending,
    userId,
    bottomRef,
}: ProfileChatDrawerProps) {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: 420 },
                    maxWidth: "100%",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2 }}
            >
                <Stack spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Переписка с переводчиком
                    </Typography>
                    <Typography variant="h6">{translatorName}</Typography>
                </Stack>
                <IconButton edge="end" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Stack>
            <Divider />

            <Box
                sx={{
                    px: 2,
                    py: 1,
                    flex: 1,
                    overflowY: "auto",
                    bgcolor: "grey.50",
                }}
            >
                {chatError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {chatError}
                    </Alert>
                )}

                {(chatLoading || historyLoading) && !chatError ? (
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{ minHeight: 160 }}
                    >
                        <CircularProgress size={32} />
                    </Stack>
                ) : messages.length === 0 ? (
                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                        История сообщений пока пустая. Напишите первое сообщение.
                    </Typography>
                ) : (
                    <Stack spacing={1.5} sx={{ pb: 2 }}>
                        {messages.map((message) => {
                            const isOwn = message.sender === userId;
                            return (
                                <Stack
                                    key={message.id}
                                    alignItems={isOwn ? "flex-end" : "flex-start"}
                                >
                                    <Box
                                        sx={{
                                            maxWidth: "86%",
                                            px: 2,
                                            py: 1.25,
                                            borderRadius: 3,
                                            bgcolor: isOwn
                                                ? "primary.main"
                                                : "background.paper",
                                            color: isOwn
                                                ? "primary.contrastText"
                                                : "text.primary",
                                            borderBottomRightRadius: isOwn ? 0 : 3,
                                            borderBottomLeftRadius: isOwn ? 3 : 0,
                                            boxShadow: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ whiteSpace: "pre-wrap" }}
                                        >
                                            {message.text}
                                        </Typography>
                                    </Box>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ mt: 0.5, pr: isOwn ? 0.5 : 0 }}
                                    >
                                        <Typography variant="caption" color="text.secondary">
                                            {formatMessageTime(message.created_at)}
                                        </Typography>
                                        {isOwn && message.is_read && (
                                            <Typography variant="caption" color="text.secondary">
                                                прочитано
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            );
                        })}
                        <Box ref={bottomRef} />
                    </Stack>
                )}
            </Box>

            <Divider />
            <Box
                component="form"
                onSubmit={onSendMessage}
                sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                }}
            >
                <TextField
                    multiline
                    minRows={2}
                    maxRows={4}
                    placeholder="Введите сообщение…"
                    value={messageDraft}
                    onChange={(event) => onMessageDraftChange(event.target.value)}
                    disabled={chatLoading || historyLoading || isSending}
                />
                <Button
                    variant="contained"
                    endIcon={<SendRoundedIcon />}
                    type="submit"
                    disabled={
                        !messageDraft.trim() || chatLoading || historyLoading || isSending
                    }
                >
                    Отправить
                </Button>
            </Box>
        </Drawer>
    );
}

