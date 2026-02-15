"use client";

import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useProductReviews } from "@/hooks/queries/useProductReviews";
import { useVendor } from "@/hooks/queries/useVendor";
import { useReviewBooking } from "@/hooks/queries/useReviewBooking";
import { useCreateReview } from "@/hooks/queries/useCreateReview";
import { useDeleteReview } from "@/hooks/queries/useDeleteReview";

import { Review } from "@/types/vendor-reviews";
import StarInput from "./StarInput";
import ReviewsSkeleton from "@/components/skeleton/ReviewsSkeleton";

interface Props {
    productUuid: string;
    isOwnProduct: boolean;
}

export default function ProductReviews({
    productUuid,
    isOwnProduct,
}: Props) {
    const { data: me } = useVendor();

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useProductReviews(productUuid);

    const { data: bookingId, isLoading: checking } =
        useReviewBooking(productUuid);

    const { mutate: createReview, isPending } = useCreateReview({
        onSuccess: () => {
            toast.success("Review submitted successfully!");
        },
        onError: (error) => {
            toast.error(
                error.message ||
                    "Failed to submit review. Please try again."
            );
        },
    });

    const { mutate: deleteReview, isPending: deleting } = useDeleteReview({
        onSuccess: () => {
            toast.success("Review deleted successfully");
        },
        onError: (error) => {
            toast.error(
                error.message ||
                    "Failed to delete review. Please try again."
            );
        },
    });

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const reviews: Review[] =
        data?.pages.flatMap((p) => p.reviews) ?? [];

    const hasAlreadyReviewed = reviews.some(
        (r) => r.reviewerId === me?.vendor.id
    );

    const handleSubmit = () => {
        if (!rating || !bookingId) return;

        createReview({
            productUuid,
            bookingId,
            rating,
            comment,
        });

        setRating(0);
        setComment("");
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    return (
        <section className="mt-16 space-y-6">
            {/* HEADER */}
            <div>
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                </p>
            </div>

            {/* CREATE REVIEW */}
            {!checking && (
                <>
                    {isOwnProduct ? (
                        <Alert>
                            <AlertDescription className="text-sm">
                                You’ve put great work into this service ✨  
                                Reviews are meant for customers, so you can’t
                                review your own offering.
                            </AlertDescription>
                        </Alert>
                    ) : !bookingId ? (
                        <Alert>
                            <AlertDescription className="text-sm">
                                Once you complete a booking with this vendor,
                                you’ll be able to share your experience here.
                            </AlertDescription>
                        </Alert>
                    ) : hasAlreadyReviewed ? (
                        <Alert variant="destructive">
                            <AlertDescription className="text-sm">
                                You’ve already shared a review for this service.
                                You can delete your existing review if you’d
                                like to post a new one.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Card className="p-6 rounded-lg border shadow-sm">
                            <h3 className="font-semibold mb-4">
                                Write a Review
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Overall Rating
                                    </label>
                                    <StarInput
                                        value={rating}
                                        onChange={setRating}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Your Review
                                    </label>
                                    <Textarea
                                        placeholder="Share details of your experience with this vendor..."
                                        value={comment}
                                        onChange={(e) =>
                                            setComment(e.target.value)
                                        }
                                        className="min-h-[100px] resize-none"
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={!rating || isPending}
                                    className="bg-gradient-primary"
                                >
                                    {isPending
                                        ? "Submitting..."
                                        : "Submit Review"}
                                </Button>
                            </div>
                        </Card>
                    )}
                </>
            )}

            <Separator className="my-8" />

            {/* REVIEWS LIST */}
            {isLoading && <ReviewsSkeleton />}

            {!isLoading && reviews.length === 0 && (
                <div className="text-center py-12">
                    <Star className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold">No reviews yet</h3>
                    <p className="text-sm text-muted-foreground">
                        Be the first to share your experience with this vendor
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {reviews.map((review) => {
                    const isMine = review.reviewerId === me?.vendor.id;

                    return (
                        <Card
                            key={review.id}
                            className="p-6 rounded-lg border shadow-sm group hover:shadow-md transition-shadow"
                        >
                            <div className="flex gap-4">
                                {/* Avatar */}
                                <Avatar className="h-10 w-10 border">
                                    <AvatarFallback className="bg-gradient-primary text-white font-bold">
                                        {getInitials(review.reviewerName)}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-sm">
                                                    {review.reviewerName}
                                                </h4>
                                                {isMine && (
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {review.reviewerOccupation}
                                            </p>
                                        </div>

                                        {isMine && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="
                                                    opacity-0
                                                    group-hover:opacity-100
                                                    transition-opacity
                                                    text-muted-foreground
                                                    hover:text-destructive
                                                    hover:bg-destructive/10
                                                "
                                                onClick={() =>
                                                    deleteReview({
                                                        productUuid,
                                                        bookingId:
                                                            review.bookingId,
                                                    })
                                                }
                                                disabled={deleting}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                        review.rating >=
                                                        i + 1
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "fill-muted text-muted"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>

                                    {review.comment && (
                                        <p className="text-sm leading-relaxed">
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* LOAD MORE */}
            {hasNextPage && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="min-w-[160px]"
                    >
                        {isFetchingNextPage
                            ? "Loading..."
                            : "Show More Reviews"}
                    </Button>
                </div>
            )}
        </section>
    );
}
