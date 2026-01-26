import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorMarketplaceQueryKeys } from "./queryKeys";
import {
    CreateVendorProductPayload,
    VendorProductResponse,
} from "@/types/admin/vendor-products";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

export function useCreateVendorProduct() {
    const queryClient = useQueryClient();

    return useMutation<
        VendorProductResponse,
        unknown,
        CreateVendorProductPayload
    >({
        mutationFn: async (payload) => {
            const { data } = await axios.post<VendorProductResponse>(
                "/api/admin/vendor-products/create",
                payload,
            );
            return data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: adminVendorMarketplaceQueryKeys.all,
            });
        },

        onError: (err) => {
            toast.error(getApiErrorMessage(err, "Unable to create listing"));
        },
    });
}
