import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Rating,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
    createReview,
    updateReview,
    fetchReview,
    type ReviewCreateDTO,
} from "../utils/reviews";

interface CreateReviewDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    threadId?: number;
    orderId?: number;
    reviewId?: number;
}

const MAX_COMMENT_LENGTH = 600;

const RATING_LABELS: Record<number, string> = {
    1: "Ужасно",
    2: "Скорее плохо",
    3: "Нормально",
    4: "Хорошо",
    5: "Отлично",
};

export default function CreateReviewDialog({
    open,
    onClose,
    onSuccess,
    threadId,
    orderId,
    reviewId,
}: CreateReviewDialogProps) {
    const [rating, setRating] = useState<number | null>(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!reviewId;

    // Загрузка отзыва для редактирования
    useEffect(() => {
        if (!open || !reviewId) {
            setRating(5);
            setComment("");
            setError(null);
            return;
        }

        let isMounted = true;
        setLoadingReview(true);
        setError(null);

        fetchReview(reviewId)
            .then((review) => {
                if (!isMounted) return;
                setRating(review.rating);
                setComment(review.comment || "");
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(
                    err instanceof Error ? err.message : "Ошибка загрузки отзыва",
                );
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingReview(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [open, reviewId]);

    const handleSubmit = async () => {
        if (!rating) {
            setError("Пожалуйста, выберите оценку");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isEditMode) {
                if (!reviewId) {
                    setError("Не указан ID отзыва");
                    return;
                }

                await updateReview(reviewId, {
                    rating,
                    comment: comment.trim() || undefined,
                });
            } else {
                if (!threadId && !orderId) {
                    setError("Не указан thread или order");
                    return;
                }

                const data: ReviewCreateDTO = {
                    rating,
                    comment: comment.trim() || undefined,
                };
                if (threadId) data.thread = threadId;
                if (orderId) data.order = orderId;

                await createReview(data);
                setRating(5);
                setComment("");
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : isEditMode
                      ? "Ошибка при обновлении отзыва"
                      : "Ошибка при создании отзыва",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setRating(5);
        setComment("");
        setError(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown={loading}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 18px 40px rgba(15,23,42,.14)",
                },
            }}
        >
            <DialogTitle sx={{ pb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {isEditMode ? "Редактировать отзыв" : "Оцените работу переводчика"}
                </Typography>
                {!isEditMode && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        Короткий отзыв поможет другим заказчикам и самому переводчику.
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent sx={{ pt: 0, pb: 1 }}>
                {loadingReview ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        {/* Блок рейтинга */}
                        <Box
                            sx={{
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                p: 2.5,
                            }}
                        >
                            <Stack spacing={1.5} alignItems="center">
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontWeight: 500 }}
                                >
                                    Оценка
                                </Typography>

                                <Rating
                                    value={rating}
                                    onChange={(_, newValue) => setRating(newValue)}
                                    size="large"
                                    sx={{
                                        "& .MuiRating-iconFilled": {
                                            color: "primary.main", // звёзды в цвете primary вместо жёлтого
                                        },
                                        "& .MuiRating-iconHover": {
                                            color: "primary.main",
                                        },
                                    }}
                                />

                                {rating && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontWeight: 500 }}
                                    >
                                        {RATING_LABELS[rating]}
                                    </Typography>
                                )}

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ textAlign: "center" }}
                                >
                                    Оцените общий опыт работы с переводчиком по этому заказу.
                                </Typography>
                            </Stack>
                        </Box>

                        {/* Комментарий */}
                        <Stack spacing={0.75}>
                            <TextField
                                label="Комментарий (необязательно)"
                                multiline
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                fullWidth
                                inputProps={{ maxLength: MAX_COMMENT_LENGTH }}
                            />
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    Кратко опишите, что было хорошо, а что можно улучшить.
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ whiteSpace: "nowrap" }}
                                >
                                    {comment.length}/{MAX_COMMENT_LENGTH}
                                </Typography>
                            </Box>
                        </Stack>

                        {error && (
                            <Typography variant="body2" color="error">
                                {error}
                            </Typography>
                        )}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    pt: 2,
                    pb: 2.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Button onClick={handleClose} disabled={loading || loadingReview}>
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || loadingReview || !rating}
                    startIcon={
                        loading ? <CircularProgress size={16} thickness={4} /> : null
                    }
                >
                    {loading
                        ? isEditMode
                            ? "Сохраняем..."
                            : "Отправляем..."
                        : isEditMode
                          ? "Сохранить изменения"
                          : "Отправить отзыв"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
