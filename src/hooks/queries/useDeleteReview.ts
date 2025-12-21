// src/hooks/mutations/useDeleteReview.ts
import {
    useMutation,
    useQueryClient,
    UseMutationOptions,
} from "@tanstack/react-query";
import axios from "axios";

interface DeleteReviewPayload {
    productUuid: string;
    bookingId: number;
}

interface DeleteReviewResponse {
    success: boolean;
    message: string;
}

export function useDeleteReview(
    options?: UseMutationOptions<
        DeleteReviewResponse,
        Error,
        DeleteReviewPayload
    >
) {
    const queryClient = useQueryClient();

    return useMutation<
        DeleteReviewResponse,
        Error,
        DeleteReviewPayload
    >({
        ...options,

        mutationFn: async ({ productUuid, bookingId }) => {
            const { data } = await axios.delete<DeleteReviewResponse>(
                `/api/vendors/products/${productUuid}/reviews`,
                {
                    data: { bookingId },
                    withCredentials: true,
                }
            );

            return data;
        },

        onSuccess: (...args) => {
            const [_, variables] = args;

            queryClient.invalidateQueries({
                queryKey: ["product-reviews", variables.productUuid],
            });

            queryClient.invalidateQueries({
                queryKey: ["vendor-product", variables.productUuid],
            });

            options?.onSuccess?.(...args);
        },

        onError: (...args) => {
            options?.onError?.(...args);
        },
    });
}
