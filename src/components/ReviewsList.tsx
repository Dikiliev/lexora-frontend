import {
    Button,
    IconButton,
    Paper,
    Rating,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useCallback, useEffect, useState } from "react";
import { fetchReviews, type ReviewDTO } from "../utils/reviews";
import { useAuthStore } from "../stores/authStore";
import CreateReviewDialog from "./CreateReviewDialog";

interface ReviewsListProps {
    translatorId: number;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function ReviewsList({ translatorId }: ReviewsListProps) {
    const [reviews, setReviews] = useState<ReviewDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const user = useAuthStore((state) => state.user);

    const isOwnReview = (review: ReviewDTO) => user?.id === review.client;

    const loadReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchReviews(translatorId);
            setReviews(response.results ?? []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Ошибка загрузки отзывов",
            );
        } finally {
            setLoading(false);
        }
    }, [translatorId]);

    useEffect(() => {
        void loadReviews();
    }, [loadReviews]);

    const handleEditReview = (reviewId: number) => {
        setEditingReviewId(reviewId);
    };

    const handleReviewUpdated = () => {
        setEditingReviewId(null);
        void loadReviews();
    };

    // Контент для разных состояний
    let content: React.ReactNode;

    if (loading && reviews.length === 0) {
        // Скелетоны при первичной загрузке
        content = (
            <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                    <Paper key={i} sx={{ p: 2.5, borderRadius: 2 }}>
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Skeleton variant="rectangular" width={84} height={20} />
                                <Skeleton variant="text" width={120} />
                            </Stack>
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="90%" />
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        );
    } else if (error) {
        content = (
            <Paper
                sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                >
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => loadReviews()}
                    >
                        Повторить попытку
                    </Button>
                </Stack>
            </Paper>
        );
    } else if (!loading && reviews.length === 0) {
        content = (
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Пока нет отзывов
                </Typography>
            </Paper>
        );
    } else {
        // Есть отзывы
        const total = reviews.length;
        const average =
            total > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
                : 0;

        content = (
            <Stack spacing={2.5}>
                {/* Шапка со средним рейтингом */}
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                >
                    <Rating
                        value={average}
                        precision={0.1}
                        readOnly
                        size="small"
                        sx={{
                            "& .MuiRating-iconFilled": {
                                color: "primary.main",
                            },
                        }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        {average.toFixed(1)} · {total} отзыв
                        {total % 10 === 1 && total % 100 !== 11
                            ? ""
                            : total % 10 >= 2 && total % 10 <= 4 && (total % 100 < 10 || total % 100 >= 20)
                              ? "а"
                              : "ов"}
                    </Typography>
                </Stack>

                {/* Список отзывов */}
                <Stack spacing={2}>
                    {reviews.map((review) => (
                        <Paper
                            key={review.id}
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                transition:
                                    "border-color .12s ease, box-shadow .12s ease, transform .12s ease",
                                "&:hover": {
                                    borderColor: "primary.main",
                                    boxShadow: "0 8px 20px rgba(15,23,42,.08)",
                                    transform: "translateY(-1px)",
                                },
                            }}
                        >
                            <Stack spacing={1.25}>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Stack spacing={0.5}>
                                        <Rating
                                            value={review.rating}
                                            readOnly
                                            size="small"
                                            sx={{
                                                "& .MuiRating-iconFilled": {
                                                    color: "primary.main",
                                                },
                                            }}
                                        />
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {formatDate(review.created_at)}
                                        </Typography>
                                    </Stack>

                                    {isOwnReview(review) && (
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            sx={{ ml: 2 }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="primary.main"
                                                sx={{ fontWeight: 500 }}
                                            >
                                                Ваш отзыв
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditReview(review.id)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    )}
                                </Stack>

                                {review.comment && (
                                    <Typography variant="body2" color="text.secondary">
                                        {review.comment}
                                    </Typography>
                                )}
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            </Stack>
        );
    }

    return (
        <>
            {content}

            {editingReviewId && (
                <CreateReviewDialog
                    open={!!editingReviewId}
                    onClose={() => setEditingReviewId(null)}
                    onSuccess={handleReviewUpdated}
                    reviewId={editingReviewId}
                />
            )}
        </>
    );
}
