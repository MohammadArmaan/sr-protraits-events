import { useQuery } from "@tanstack/react-query";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { VendorWithCatalogs } from "@/types/vendor";

export function useVendor() {
    return useQuery<VendorWithCatalogs | null>({
        queryKey: ["vendor"],
        queryFn: getCurrentVendor,
        staleTime: 2 * 60 * 1000,
        retry: false,
        refetchOnMount: "always",
    });
}
