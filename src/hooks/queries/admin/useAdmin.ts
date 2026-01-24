// src/hooks/queries/admin/useAdmin.ts
import { useQuery } from "@tanstack/react-query";
import { getCurrentAdmin } from "@/lib/admin/getCurrentAdmin";
import type { Admin } from "@/types/admin/admin";

export function useAdmin() {
    return useQuery<Admin | null>({
        queryKey: ["admin"],
        queryFn: getCurrentAdmin,
        staleTime: 2 * 60 * 1000,
        retry: false,
        refetchOnMount: "always",
    });
}
