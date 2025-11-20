import { request } from "./api";

export interface ReviewDTO {
    id: number;
    order?: number | null;
    thread?: number | null;
    client: number;
    translator: number;
    rating: number;
    comment: string;
    created_at: string;
}

export interface ReviewCreateDTO {
    thread?: number;
    order?: number;
    rating: number;
    comment?: string;
}

export interface ReviewsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ReviewDTO[];
}

export async function fetchReviews(translatorId?: number): Promise<ReviewsResponse> {
    const params = new URLSearchParams();
    if (translatorId) {
        params.set("translator", String(translatorId));
    }
    const query = params.toString();
    const url = `/reviews/${query ? `?${query}` : ""}`;
    return request<ReviewsResponse>(url);
}

export async function createReview(data: ReviewCreateDTO): Promise<ReviewDTO> {
    return request<ReviewDTO>("/reviews/", {
        method: "POST",
        json: data,
    });
}

export async function updateReview(reviewId: number, data: { rating: number; comment?: string }): Promise<ReviewDTO> {
    return request<ReviewDTO>(`/reviews/${reviewId}/`, {
        method: "PATCH",
        json: data,
    });
}

export async function fetchReview(reviewId: number): Promise<ReviewDTO> {
    return request<ReviewDTO>(`/reviews/${reviewId}/`);
}

export interface CanReviewResponse {
    can_review: boolean;
    reason?: string;
    translator_id?: number;
    translator_name?: string;
}

export async function canReviewThread(threadId: number): Promise<CanReviewResponse> {
    return request<CanReviewResponse>(`/reviews/can-review/${threadId}/`);
}

