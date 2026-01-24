import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorBannerQueryKeys } from "./queryKeys";
import { VendorBanner } from "@/types/admin/vendor-banner";

interface CreateVendorBannerResponse {
    success: true;
    banner: VendorBanner;
}

export function useCreateVendorBanner() {
    const queryClient = useQueryClient();

    return useMutation<CreateVendorBannerResponse, Error, FormData>({
        mutationFn: async (formData) => {
            const { data } = await axios.post<CreateVendorBannerResponse>(
                "/api/admin/vendor-banners/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: adminVendorBannerQueryKeys.all,
            });
        },
    });
}
