import { Avatar, Button, IconButton, Stack, Typography, Box, Link } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddIcon from "@mui/icons-material/Add";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/api";

import type { ChatThreadDTO } from "../../utils/chat";
import type { CounterpartyInfo } from "../../utils/chatThreads";

// Функция для получения полного URL аватара
function getAvatarUrl(avatar: string | null | undefined): string | undefined {
    if (!avatar) return undefined;
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
        return avatar;
    }
    const baseUrl = API_URL.replace("/api/v1", "");
    return `${baseUrl}${avatar}`;
}

interface ChatHeaderProps {
    counterparty: CounterpartyInfo | null;
    selectedThread: ChatThreadDTO | null;
    isClient: boolean;
    onOpenOrderDialog: () => void;
    onOpenReviewDialog?: () => void;
    canReview?: boolean;
    showBackButton?: boolean;
    onBack?: () => void;
}

export function ChatHeader({
    counterparty,
    selectedThread,
    isClient,
    onOpenOrderDialog,
    onOpenReviewDialog,
    canReview,
    showBackButton,
    onBack,
}: ChatHeaderProps) {
    const navigate = useNavigate();
    
    const handleNameClick = () => {
        if (!counterparty) return;
        // Если это переводчик, переходим на его профиль
        if (counterparty.translatorId) {
            navigate(`/translator/${counterparty.translatorId}`);
        }
        // Для клиентов пока нет профиля, но можно добавить позже
    };

    const avatarUrl = counterparty?.avatarUrl ? getAvatarUrl(counterparty.avatarUrl) : undefined;
    const avatarInitials = counterparty?.avatar ?? counterparty?.title?.[0] ?? "?";

    return (
        <Stack
            direction={{ xs: "row", sm: "row" }}
            spacing={1.5}
            alignItems="center"
            justifyContent="space-between"
            sx={{
                px: 2.5,
                py: 1.25,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                {showBackButton && onBack && (
                    <IconButton
                        onClick={onBack}
                        size="small"
                        sx={{ mr: 0.5, display: { xs: "inline-flex", sm: "none" } }}
                    >
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                )}

                <Avatar 
                    src={avatarUrl}
                    sx={{ width: 40, height: 40, fontSize: 18 }}
                >
                    {avatarInitials}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    {counterparty?.translatorId ? (
                        <Link
                            component={RouterLink}
                            to={`/translator/${counterparty.translatorId}`}
                            underline="hover"
                            sx={{ 
                                color: "text.primary",
                                "&:hover": { color: "primary.main" },
                                cursor: "pointer",
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={700} noWrap>
                                {counterparty?.title ?? "Собеседник"}
                            </Typography>
                        </Link>
                    ) : counterparty?.userId ? (
                        <Link
                            component={RouterLink}
                            to={`/client/${counterparty.userId}`}
                            underline="hover"
                            sx={{ 
                                color: "text.primary",
                                "&:hover": { color: "primary.main" },
                                cursor: "pointer",
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={700} noWrap>
                                {counterparty?.title ?? "Собеседник"}
                            </Typography>
                        </Link>
                    ) : (
                        <Typography variant="subtitle1" fontWeight={700} noWrap>
                            {counterparty?.title ?? "Собеседник"}
                        </Typography>
                    )}
                    {selectedThread?.order_id && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                            Заказ #{selectedThread.order_id}
                        </Typography>
                    )}
                </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                {isClient && canReview === true && onOpenReviewDialog && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RateReviewIcon />}
                        onClick={onOpenReviewDialog}
                        sx={{ display: { xs: "none", sm: "inline-flex" } }}
                    >
                        Отзыв
                    </Button>
                )}
                {isClient && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={onOpenOrderDialog}
                    >
                        Заказ
                    </Button>
                )}
            </Stack>
        </Stack>
    );
}
