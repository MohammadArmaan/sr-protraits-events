import { fetchBannerDetails } from "@/lib/vendor/fetchVendorDetails";
import { Banner } from "@/types/vendor-banner";
import { useQuery } from "@tanstack/react-query";

export function useBanners() {
    return useQuery<Banner[]>({
        queryKey: ["banners"],
        queryFn: fetchBannerDetails,
        staleTime: 5 * 60 * 1000,
    });
}
