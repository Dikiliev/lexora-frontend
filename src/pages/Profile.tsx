import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    Link,
    Paper,
    Rating,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import type { LanguagePairDTO, TranslatorProfileDTO } from "./translator-settings/types";
import type { ChatMessageDTO, ChatThreadDTO } from "../utils/chat";
import {
    buildThreadWsUrl,
    createThread,
    fetchThreadMessages,
    formatMessageTime,
    sendThreadMessage,
    upsertMessage,
} from "../utils/chat";
import { request } from "../utils/api";
import { useAuthStore } from "../stores/authStore";

function parseNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isNaN(numeric) ? null : numeric;
}

function formatMoney(value: string | number | null | undefined, currency: string) {
    const numeric = parseNumber(value);
    if (numeric === null) return "—";
    try {
        return new Intl.NumberFormat("ru-RU", { style: "currency", currency }).format(numeric);
    } catch {
        return `${numeric.toLocaleString("ru-RU")} ${currency}`;
    }
}

function formatHourly(value: string | number | null | undefined, currency: string) {
    const formatted = formatMoney(value, currency);
    return formatted === "—" ? formatted : `${formatted}/ч`;
}

function formatLanguagePair(pair: LanguagePairDTO, fallbackCurrency: string) {
    const pricePerWord = formatMoney(pair.price_per_word, pair.currency ?? fallbackCurrency);
    const pricePerHour = formatHourly(pair.price_per_hour, pair.currency ?? fallbackCurrency);
    return { pricePerWord, pricePerHour };
}

function getInitials(name: string | null | undefined) {
    if (!name) return "L";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "L";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "L";
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState<TranslatorProfileDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [chatThread, setChatThread] = useState<ChatThreadDTO | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessageDTO[]>([]);
    const [messageDraft, setMessageDraft] = useState("");
    const [isSending, setIsSending] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const user = useAuthStore((state) => state.user);
    const accessToken = useAuthStore((state) => state.accessToken);

    useEffect(() => {
        if (!id) return;
        const controller = new AbortController();
        setIsLoading(true);
        request<TranslatorProfileDTO>(`/translators/${id}/`, { signal: controller.signal })
            .then((data) => {
                setProfile(data);
                setError(null);
            })
            .catch((err) => {
                if ((err as Error).name === "AbortError") return;
                setError(err instanceof Error ? err.message : "Не удалось загрузить профиль");
                setProfile(null);
            })
            .finally(() => setIsLoading(false));

        return () => controller.abort();
    }, [id]);

    const languages = profile?.langs ?? [];
    const specializations = profile?.specializations ?? [];
    const portfolioItems = profile?.portfolio_items ?? [];
    const orderedMessages = useMemo(
        () =>
            [...chatMessages].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            ),
        [chatMessages],
    );

    useEffect(() => {
        if (!isChatOpen) return;
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [orderedMessages, isChatOpen]);

    useEffect(() => {
        if (!chatThread || !isChatOpen || !accessToken) return;

        const wsUrl = buildThreadWsUrl(chatThread.id, accessToken);
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
                        text: data.text,
                        is_read: Boolean(data.is_read),
                        created_at: data.created_at,
                    };
                    setChatMessages((prev) => upsertMessage(prev, nextMessage));
                } else if (data.type === "message.read" && data.message_id) {
                    setChatMessages((prev) =>
                        prev.map((item) =>
                            item.id === data.message_id ? { ...item, is_read: true } : item,
                        ),
                    );
                }
            } catch (err) {
                console.error("Не удалось обработать сообщение чата", err);
            }
        };

        socket.onerror = () => {
            setChatError("Не удалось установить WebSocket-соединение");
        };

        return () => {
            socketRef.current = null;
            socket.close();
        };
    }, [chatThread, isChatOpen, accessToken]);

    const stats = useMemo(() => {
        if (!profile) return [];
        const rating = Number(profile.avg_rating_cached ?? 0) || 0;
        return [
            {
                label: "Рейтинг",
                value: rating ? rating.toFixed(1) : "—",
                secondary: rating ? "на основе завершённых заказов" : undefined,
            },
            {
                label: "Завершено заказов",
                value: profile.completed_orders_count ?? 0,
            },
            {
                label: "Опыт",
                value: profile.experience_years ? `${profile.experience_years} лет` : "—",
                secondary: profile.education ? `Образование: ${profile.education}` : undefined,
            },
        ];
    }, [profile]);

    if (isLoading) {
        return (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "60vh" }}>
                <CircularProgress />
            </Stack>
        );
    }

    if (error || !profile) {
        return (
            <Paper sx={{ p: 4 }}>
                <Typography color="error">{error ?? "Переводчик не найден"}</Typography>
            </Paper>
        );
    }

    const ratingValue = Number(profile.avg_rating_cached ?? 0) || 0;
    const hourlyRateLabel = formatHourly(profile.hourly_rate, profile.currency);
    const initials = getInitials(profile.full_name);
    const translatorProfileId = profile.id;
    const isOwnProfile =
        user?.role === "translator" && (user.profile as { id?: number } | undefined)?.id === translatorProfileId;
    const canInitiateChat = !!user && (user.role === "client" || user.role === "admin");
    const chatButtonLabel = !user
        ? "Войти, чтобы написать"
        : isOwnProfile
          ? "Это ваш профиль"
          : canInitiateChat
            ? "Написать переводчику"
            : "Чат доступен клиентам";
    const chatButtonDisabled = Boolean(
        isOwnProfile || (user && !canInitiateChat) || chatLoading || historyLoading,
    );

    const handleOpenChat = async () => {
        if (!profile) return;
        if (!user) {
            navigate("/login", { state: { redirectTo: location.pathname } });
            return;
        }
        if (!canInitiateChat) {
            setChatError("Чат доступен только клиентам.");
            setIsChatOpen(true);
            return;
        }

        setIsChatOpen(true);
        setChatError(null);
        setChatLoading(true);
        setHistoryLoading(true);
        try {
            const thread = await createThread(translatorProfileId);
            setChatThread(thread);
            const history = await fetchThreadMessages(thread.id, { limit: 50 });
            const normalizedHistory = [...history.results].reverse();
            setChatMessages(normalizedHistory);
        } catch (err) {
            setChatError(err instanceof Error ? err.message : "Не удалось открыть чат");
        } finally {
            setChatLoading(false);
            setHistoryLoading(false);
        }
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        setChatError(null);
        setMessageDraft("");
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    };

    const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!chatThread) return;
        const text = messageDraft.trim();
        if (!text) return;
        setChatError(null);

        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "message", text }));
            setMessageDraft("");
            return;
        }

        try {
            setIsSending(true);
            const message = await sendThreadMessage(chatThread.id, text);
            setChatMessages((prev) => upsertMessage(prev, message));
            setMessageDraft("");
        } catch (err) {
            setChatError(err instanceof Error ? err.message : "Не удалось отправить сообщение");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Stack spacing={4} sx={{ pb: 6 }}>
            <Paper sx={{ p: { xs: 3, md: 4 } }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    alignItems={{ xs: "flex-start", md: "center" }}
                >
                    <Avatar sx={{ width: 72, height: 72, fontSize: 28 }}>{initials}</Avatar>
                    <Box flex={1}>
                        <Stack spacing={1}>
                            <Typography variant="h4" fontWeight={800}>
                                {profile.full_name || "Без имени"}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Rating value={ratingValue} precision={0.1} readOnly />
                                <Typography color="text.secondary">{ratingValue.toFixed(1)}</Typography>
                                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                <Typography color="text.secondary">{hourlyRateLabel}</Typography>
                            </Stack>
                            {profile.bio && (
                                <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                                    {profile.bio}
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                    <Button
                        variant="contained"
                        size="large"
                        disabled={chatButtonDisabled}
                        onClick={handleOpenChat}
                    >
                        {chatButtonLabel}
                    </Button>
                </Stack>
            </Paper>

            <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                    Языковые пары и тарифы
                </Typography>
                {languages.length === 0 ? (
                    <Typography color="text.secondary">Переводчик ещё не указал языковые пары.</Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Пара</TableCell>
                                <TableCell>Цена за слово</TableCell>
                                <TableCell>Цена в час</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {languages.map((pair, index) => {
                                const { pricePerWord, pricePerHour } = formatLanguagePair(pair, profile.currency);
                                return (
                                    <TableRow key={`${pair.language_from}-${pair.language_to}-${index}`}>
                                        <TableCell>
                                            {pair.language_from ?? "—"} → {pair.language_to ?? "—"}
                                        </TableCell>
                                        <TableCell>{pricePerWord}</TableCell>
                                        <TableCell>{pricePerHour}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                    Специализации
                </Typography>
                {specializations.length === 0 ? (
                    <Typography color="text.secondary">Специализации пока не выбраны.</Typography>
                ) : (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {specializations.map((spec) => (
                            <Chip key={spec.id} label={spec.title} />
                        ))}
                    </Stack>
                )}
            </Paper>

            <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                    Портфолио
                </Typography>
                {portfolioItems.length === 0 ? (
                    <Typography color="text.secondary">Портфолио пока пустое.</Typography>
                ) : (
                    <Stack spacing={2}>
                        {portfolioItems.map((item) => (
                            <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {item.title}
                                    </Typography>
                                    {item.description && <Typography color="text.secondary">{item.description}</Typography>}
                                    <Link href={item.file} target="_blank" rel="noopener noreferrer">
                                        Открыть файл
                                    </Link>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Paper>

            <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                    Показатели
                </Typography>
        <Stack spacing={2}>
                    {stats.map((stat) => (
                        <Box key={stat.label}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {stat.label}
                            </Typography>
                            <Typography variant="h5">{stat.value}</Typography>
                            {stat.secondary && (
                                <Typography variant="body2" color="text.secondary">
                                    {stat.secondary}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Stack>
            </Paper>

            <Drawer
                anchor="right"
                open={isChatOpen}
                onClose={handleCloseChat}
                PaperProps={{
                    sx: {
                        width: { xs: "100%", sm: 420 },
                        maxWidth: "100%",
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
                    <Stack spacing={0.5}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Переписка с переводчиком
            </Typography>
                        <Typography variant="h6">{profile.full_name || "Без имени"}</Typography>
                    </Stack>
                    <IconButton edge="end" onClick={handleCloseChat}>
                        <CloseIcon />
                    </IconButton>
            </Stack>
            <Divider />

                <Box sx={{ px: 2, py: 1, flex: 1, overflowY: "auto" }}>
                    {chatError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {chatError}
                        </Alert>
                    )}
                    {(chatLoading || historyLoading) && !chatError ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 160 }}>
                            <CircularProgress size={32} />
                        </Stack>
                    ) : orderedMessages.length === 0 ? (
                        <Typography color="text.secondary" sx={{ mt: 2 }}>
                            История сообщений пока пустая.
                        </Typography>
                    ) : (
                        <Stack spacing={1.5} sx={{ pb: 2 }}>
                            {orderedMessages.map((message) => {
                                const isOwn = message.sender === user?.id;
                                return (
                                    <Stack key={message.id} alignItems={isOwn ? "flex-end" : "flex-start"}>
                                        <Box
                                            sx={{
                                                maxWidth: "86%",
                                                px: 2,
                                                py: 1.25,
                                                borderRadius: 3,
                                                bgcolor: isOwn ? "primary.main" : "grey.100",
                                                color: isOwn ? "primary.contrastText" : "text.primary",
                                                borderBottomRightRadius: isOwn ? 0 : 3,
                                                borderBottomLeftRadius: isOwn ? 3 : 0,
                                                boxShadow: 1,
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                                {message.text}
                </Typography>
            </Box>
                                        <Stack direction="row" spacing={1} sx={{ mt: 0.5, pr: isOwn ? 0.5 : 0 }}>
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
                    onSubmit={handleSendMessage}
                    sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                    <TextField
                        multiline
                        minRows={2}
                        maxRows={4}
                        placeholder="Введите сообщение..."
                        value={messageDraft}
                        onChange={(event) => setMessageDraft(event.target.value)}
                        disabled={!chatThread || chatLoading || historyLoading || isSending}
                    />
                    <Button
                        variant="contained"
                        endIcon={<SendRoundedIcon />}
                        type="submit"
                        disabled={
                            !chatThread ||
                            !messageDraft.trim() ||
                            chatLoading ||
                            historyLoading ||
                            isSending
                        }
                    >
                        Отправить
                    </Button>
                </Box>
            </Drawer>
        </Stack>
    );
}

