import { useQuery } from "@tanstack/react-query";

export interface VendorSubCategory {
    id: number;
    name: string;
    slug: string;
    categoryId: number;
    isActive: boolean;
}

async function fetchVendorCatalogSubCategories(
    categoryId: number,
): Promise<VendorSubCategory[]> {
    const res = await fetch(
        `/api/admin/vendor-sub-categories?categoryId=${categoryId}`,
        {
            credentials: "include",
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch subcategories");
    }

    return res.json();
}

export function useVendorCatalogSubCategories(categoryId?: number) {
    return useQuery({
        queryKey: ["admin-subcategories", categoryId ?? "all"],
        queryFn: async () => {
            const url = categoryId
                ? `/api/admin/vendor-sub-categories?categoryId=${categoryId}`
                : `/api/admin/vendor-sub-categories`;

            const res = await fetch(url, {
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || "Failed to fetch subcategories");
            }

            return res.json();
        },
        enabled: true, // 👈 always allow fetch
        staleTime: 1000 * 60 * 5,
    });
}
