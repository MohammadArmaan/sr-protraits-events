import { useQuery } from "@tanstack/react-query";

export interface VendorCategory {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
}

async function fetchVendorCatalogCategories(): Promise<VendorCategory[]> {
    const res = await fetch("/api/admin/vendor-categories", {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch categories");
    }

    return res.json();
}

export function useVendorCatalogCategories() {
    return useQuery({
        queryKey: ["admin-categories"],
        queryFn: fetchVendorCatalogCategories,
        staleTime: 1000 * 60 * 10, // 10 mins (taxonomy rarely changes)
    });
}
