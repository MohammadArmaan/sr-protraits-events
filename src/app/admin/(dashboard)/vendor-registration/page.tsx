"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { VendorFilters } from "./_components/VendorFilters";
import { VendorRegistrationTable } from "./_components/VendorRegistrationTable";
import { PageHeader } from "@/components/ui/page-header";
import {
    VendorRegistrationStatus,
    VendorSortOption,
} from "@/types/admin/vendor-registration";
import { useAllVendorRegistrations } from "@/hooks/queries/admin/useAllVendorRegistrations";
import { REGISTRATION_PAGE_SIZE } from "@/lib/admin/constants";
import { VendorPagination } from "./_components/VendorPagination";

const DEFAULT_STATUS: VendorRegistrationStatus | "ALL" = "ALL";
const DEFAULT_SORT: VendorSortOption = "date_desc";

export default function VendorRegistrationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    /* ---------------- URL STATE ---------------- */

    const status =
        (searchParams.get("status") as VendorRegistrationStatus | "ALL") ??
        DEFAULT_STATUS;

    const sort = (searchParams.get("sort") as VendorSortOption) ?? DEFAULT_SORT;

    const page = Number(searchParams.get("page") ?? 1);

    /* ---------------- DATA ---------------- */

    const { data, isLoading, error } = useAllVendorRegistrations();

    /* ---------------- URL NORMALIZATION ---------------- */

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        let shouldUpdate = false;

        if (!params.get("status")) {
            params.set("status", "ALL");
            shouldUpdate = true;
        }

        if (!params.get("sort")) {
            params.set("sort", DEFAULT_SORT);
            shouldUpdate = true;
        }

        if (!params.get("page")) {
            params.set("page", "1");
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            router.replace(`?${params.toString()}`);
        }
    }, [searchParams, router]);

    /* ---------------- FILTER + SORT + PAGINATION ---------------- */

    const { paginatedVendors, totalPages, totalCount } = useMemo(() => {
        if (!data?.vendors) {
            return {
                paginatedVendors: [],
                totalPages: 1,
                totalCount: 0,
            };
        }

        let list = [...data.vendors];

        // Filter
        if (status !== "ALL") {
            list = list.filter((v) => v.status === status);
        }

        // Sort
        switch (sort) {
            case "name_asc":
                list.sort((a, b) => a.fullName.localeCompare(b.fullName));
                break;
            case "name_desc":
                list.sort((a, b) => b.fullName.localeCompare(a.fullName));
                break;
            case "date_asc":
                list.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime(),
                );
                break;
            case "date_desc":
                list.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                );
                break;
        }

        const totalCount = list.length;
        const totalPages = Math.max(
            1,
            Math.ceil(totalCount / REGISTRATION_PAGE_SIZE),
        );

        const start = (page - 1) * REGISTRATION_PAGE_SIZE;
        const end = start + REGISTRATION_PAGE_SIZE;

        return {
            paginatedVendors: list.slice(start, end),
            totalPages,
            totalCount,
        };
    }, [data, status, sort, page]);

    /* ---------------- URL UPDATER ---------------- */

    const updateQuery = (key: string, value: string, resetPage = false) => {
        const params = new URLSearchParams(searchParams.toString());

        params.set(key, value);

        if (resetPage) {
            params.set("page", "1");
        }

        router.push(`?${params.toString()}`);
    };

    /* ---------------- RENDER ---------------- */

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title="Vendor Registration"
                description={`${totalCount} vendors`}
            />

            <VendorFilters
                status={status}
                sort={sort}
                onStatusChange={(val) => updateQuery("status", val, true)}
                onSortChange={(val) => updateQuery("sort", val, true)}
            />

            <VendorRegistrationTable
                vendors={paginatedVendors}
                isLoading={isLoading}
                error={error?.message}
            />

            <VendorPagination
                page={page}
                totalPages={totalPages}
                onPageChange={(nextPage) =>
                    updateQuery("page", String(nextPage))
                }
            />
        </div>
    );
}
