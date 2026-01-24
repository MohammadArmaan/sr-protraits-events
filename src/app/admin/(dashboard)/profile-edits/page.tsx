"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { useProfileEditList } from "@/hooks/queries/admin/useProfileEditList";
import {
    ProfileEditFilters,
    ProfileEditSort,
} from "./_components/ProfileEditFilters";
import { REGISTRATION_PAGE_SIZE } from "@/lib/admin/constants";
import { EditPagination } from "./_components/EditPagination";
import { ProfileEditTable } from "./_components/ProfileEditTable";
import { ProfileEditStatus } from "@/types/admin/profile-edit";

const DEFAULT_SORT: ProfileEditSort = "date_desc";
const DEFAULT_STATUS: ProfileEditStatus = "ALL";

export default function ProfileEditRequestsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const sort = (searchParams.get("sort") as ProfileEditSort) ?? DEFAULT_SORT;

    const status =
        (searchParams.get("status") as ProfileEditStatus) ?? DEFAULT_STATUS;

    const page = Number(searchParams.get("page") ?? 1);

    const { data, isLoading } = useProfileEditList();

    /* normalize url */
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        let changed = false;

        if (!params.get("sort")) {
            params.set("sort", DEFAULT_SORT);
            changed = true;
        }

        if (!params.get("status")) {
            params.set("status", DEFAULT_STATUS);
            changed = true;
        }

        if (!params.get("page")) {
            params.set("page", "1");
            changed = true;
        }

        if (changed) router.replace(`?${params.toString()}`);
    }, [searchParams, router]);

    const { paginated, totalPages } = useMemo(() => {
        if (!data?.edits) {
            return { paginated: [], totalPages: 1 };
        }

        let list = [...data.edits];

        // ✅ STATUS FILTER
        if (status !== "ALL") {
            list = list.filter((edit) => edit.status === status);
        }

        // ✅ SORT
        switch (sort) {
            case "name_asc":
                list.sort((a, b) => a.vendorName.localeCompare(b.vendorName));
                break;
            case "name_desc":
                list.sort((a, b) => b.vendorName.localeCompare(a.vendorName));
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

        const totalPages = Math.max(
            1,
            Math.ceil(list.length / REGISTRATION_PAGE_SIZE),
        );

        const start = (page - 1) * REGISTRATION_PAGE_SIZE;

        return {
            paginated: list.slice(start, start + REGISTRATION_PAGE_SIZE),
            totalPages,
        };
    }, [data, sort, status, page]);

    const updateQuery = (k: string, v: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(k, v);
        if (k !== "page") params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Profile Edit Requests"
                description={`${data?.edits.length ?? 0} requests`}
            />

            <ProfileEditFilters
                sort={sort}
                status={status}
                onSortChange={(v) => updateQuery("sort", v)}
                onStatusChange={(v) => updateQuery("status", v)}
            />

            <ProfileEditTable edits={paginated} isLoading={isLoading} />

            <EditPagination
                page={page}
                totalPages={totalPages}
                onPageChange={(nextPage) =>
                    updateQuery("page", String(nextPage))
                }
            />
        </div>
    );
}
