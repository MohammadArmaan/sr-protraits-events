import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type QueryValue = string | number | null | undefined;

/* ------------------ SINGLE PARAM (Pagination) ------------------ */
export function updateQuery(
    router: AppRouterInstance,
    searchParams: URLSearchParams,
    key: string,
    value?: QueryValue
) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null || value === undefined || value === "") {
        params.delete(key);
    } else {
        params.set(key, String(value));
    }

    router.push(`/vendor/shop?${params.toString()}`);
}

/* ------------------ MULTIPLE PARAMS (Filters) ------------------ */
export function updateMultipleQueries(
    router: AppRouterInstance,
    searchParams: URLSearchParams,
    updates: Record<string, QueryValue>
) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }
    });

    // reset page when filters change
    if (!("page" in updates)) {
        params.set("page", "1");
    }

    router.push(`/vendor/shop?${params.toString()}`);
}
