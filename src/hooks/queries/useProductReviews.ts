import { useInfiniteQuery } from "@tanstack/react-query";
import { ReviewsResponse } from "@/types/vendor-reviews";
import axios from "axios";

export function useProductReviews(productUuid: string) {
    return useInfiniteQuery<ReviewsResponse>({
        queryKey: ["product-reviews", productUuid],

        queryFn: async ({ pageParam }) => {
            const { data } = await axios.get<ReviewsResponse>(
                `/api/vendors/products/${productUuid}/reviews`,
                {
                    params: {
                        cursor: pageParam ?? undefined,
                    },
                }
            );

            return data;
        },

        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!productUuid,
    });
}
