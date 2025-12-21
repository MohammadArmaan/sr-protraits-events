export interface Review {
    id: number;
    bookingId: number;
    rating: number;
    comment: string | null;
    createdAt: string;

    reviewerId: number;
    reviewerName: string;
    reviewerOccupation: string;
}

export interface ReviewsResponse {
    reviews: Review[];
    nextCursor: string | null;
}