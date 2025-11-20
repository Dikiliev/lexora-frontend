import { Avatar, Button, IconButton, Stack, Typography, Box } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddIcon from "@mui/icons-material/Add";
import RateReviewIcon from "@mui/icons-material/RateReview";

import type { ChatThreadDTO } from "../../utils/chat";
import type { CounterpartyInfo } from "../../utils/chatThreads";

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

                <Avatar sx={{ width: 40, height: 40, fontSize: 18 }}>
                    {counterparty?.avatar ?? counterparty?.title?.[0] ?? "?"}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {counterparty?.title ?? "Собеседник"}
                    </Typography>
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
