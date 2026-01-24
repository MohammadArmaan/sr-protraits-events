import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorBannerQueryKeys } from "./queryKeys";
import { VendorBanner } from "@/types/admin/vendor-banner";

interface VendorBannerListResponse {
    success: true;
    banners: VendorBanner[];
}

export function useAdminVendorBanners() {
    return useQuery<VendorBannerListResponse>({
        queryKey: adminVendorBannerQueryKeys.all,
        queryFn: async () => {
            const { data } = await axios.get<VendorBannerListResponse>(
                "/api/admin/vendor-banners/list"
            );
            return data;
        },
    });
}
