import { Button, Stack, Typography } from "@mui/material";
import type { ChatThreadDTO } from "../../utils/chat";
import type { CounterpartyInfo } from "../../utils/chatThreads";
import AddIcon from "@mui/icons-material/Add";

interface ChatHeaderProps {
    counterparty: CounterpartyInfo | null;
    selectedThread: ChatThreadDTO | null;
    isClient: boolean;
    onOpenOrderDialog: () => void;
}

export function ChatHeader({ counterparty, selectedThread, isClient, onOpenOrderDialog }: ChatHeaderProps) {
    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                    {counterparty?.title ?? "Собеседник"}
                </Typography>
                {selectedThread?.order_id && (
                    <Typography variant="caption" color="text.secondary">
                        Заказ #{selectedThread.order_id}
                    </Typography>
                )}
                {(selectedThread?.unread_count || 0) > 0 && (
                    <Typography variant="caption" color="primary">
                        Непрочитано: {selectedThread?.unread_count}
                    </Typography>
                )}
            </Stack>
            {isClient && (
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={onOpenOrderDialog}>
                    Предложить заказ
                </Button>
            )}
        </Stack>
    );
}

