// src/hooks/mutations/useCreateReview.ts
import {
    useMutation,
    useQueryClient,
    UseMutationOptions,
} from "@tanstack/react-query";
import axios from "axios";

interface CreateReviewPayload {
    productUuid: string;
    bookingId: number;
    rating: number;
    comment?: string;
}

interface CreateReviewResponse {
    success: boolean;
    message: string;
}

export function useCreateReview(
    options?: UseMutationOptions<
        CreateReviewResponse,
        Error,
        CreateReviewPayload
    >
) {
    const queryClient = useQueryClient();

    return useMutation<
        CreateReviewResponse,
        Error,
        CreateReviewPayload
    >({
        ...options, // ✅ allow consumer overrides

        mutationFn: async ({
            productUuid,
            bookingId,
            rating,
            comment,
        }) => {
            const { data } = await axios.post<CreateReviewResponse>(
                `/api/vendors/products/${productUuid}/reviews`,
                { bookingId, rating, comment },
                { withCredentials: true }
            );

            return data;
        },

        onSuccess: (...args) => {
            const [_, variables] = args;

            // 🔄 internal cache logic
            queryClient.invalidateQueries({
                queryKey: ["product-reviews", variables.productUuid],
            });

            queryClient.invalidateQueries({
                queryKey: ["vendor-product", variables.productUuid],
            });

            // 🔁 forward ALL args safely
            options?.onSuccess?.(...args);
        },

        onError: (...args) => {
            options?.onError?.(...args);
        },
    });
}
