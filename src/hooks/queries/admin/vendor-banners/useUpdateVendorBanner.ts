import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorBannerQueryKeys } from "./queryKeys";
import { VendorBanner } from "@/types/admin/vendor-banner";

interface UpdateVendorBannerInput {
    id: number;
    formData: FormData;
}

interface UpdateVendorBannerResponse {
    success: true;
    banner: VendorBanner;
}

export function useUpdateVendorBanner() {
    const queryClient = useQueryClient();

    return useMutation<
        UpdateVendorBannerResponse,
        Error,
        UpdateVendorBannerInput
    >({
        mutationFn: async ({ id, formData }) => {
            const { data } = await axios.put<UpdateVendorBannerResponse>(
                `/api/admin/vendor-banners/upload/${id}`,
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
