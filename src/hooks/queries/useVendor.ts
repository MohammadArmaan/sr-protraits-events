// src/hooks/queries/useVendor.ts
import { useQuery } from "@tanstack/react-query";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import type { Vendor } from "@/types/vendor";

export function useVendor() {
    return useQuery<Vendor | null>({
        queryKey: ["vendor"],
        queryFn: getCurrentVendor,
        staleTime: 2 * 60 * 1000, 
        retry: false,
        refetchOnMount: "always", 
    });
}
