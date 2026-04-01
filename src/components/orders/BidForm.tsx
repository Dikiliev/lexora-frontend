import { useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useAuthStore } from "../../stores/authStore";
import { request } from "../../utils/api";

interface BidFormProps {
    orderId: number;
    onSuccess?: () => void;
}

export interface OrderBidDTO {
    id: number;
    translator: number;
    translator_name?: string | null;
    translator_rating?: number | null;
    proposed_price: string;
    comment: string;
    status: string;
    created_at: string;
}

export default function BidForm({ orderId, onSuccess }: BidFormProps) {
    const user = useAuthStore((state) => state.user);
    const [proposedPrice, setProposedPrice] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!proposedPrice.trim()) {
            setError("Укажите предлагаемую цену");
            return;
        }

        const price = Number(proposedPrice);
        if (Number.isNaN(price) || price <= 0) {
            setError("Цена должна быть положительным числом");
            return;
        }

        setIsSubmitting(true);

        try {
            await request<OrderBidDTO>(`/orders/${orderId}/bids/`, {
                method: "POST",
                json: {
                    proposed_price: price,
                    comment: comment.trim() || "",
                },
            });

            setSuccess(true);
            setProposedPrice("");
            setComment("");
            onSuccess?.();

            // Скрываем сообщение об успехе через 3 секунды
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось отправить отклик");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user || user.role !== "translator") {
        return null;
    }

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">Отклик успешно отправлен!</Alert>}

                <TextField
                    label="Предлагаемая цена"
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    required
                    fullWidth
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Укажите вашу цену за выполнение этого заказа"
                />

                <TextField
                    label="Комментарий (необязательно)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    helperText="Добавьте комментарий к вашему отклику"
                />

                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{ alignSelf: "flex-start" }}
                >
                    {isSubmitting ? "Отправка..." : "Отправить отклик"}
                </Button>
            </Stack>
        </Box>
    );
}

