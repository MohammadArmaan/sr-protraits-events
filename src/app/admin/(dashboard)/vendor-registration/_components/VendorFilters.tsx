// src/app/admin/vendor-registration/_components/VendorFilters.tsx
"use client";

import { VendorRegistrationStatus } from "@/types/admin/vendor-registration";
import { VendorSortOption } from "@/types/admin/vendor-registration";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    status: VendorRegistrationStatus | "ALL";
    sort: VendorSortOption;
    onStatusChange: (status: VendorRegistrationStatus | "ALL") => void;
    onSortChange: (sort: VendorSortOption) => void;
}

export function VendorFilters({
    status,
    sort,
    onStatusChange,
    onSortChange,
}: Props) {
    return (
        <div className="flex gap-4">
            {/* STATUS */}
            <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="CATALOG_CREATED">Pending</SelectItem>
                    <SelectItem value="AWAITING_ACTIVATION">
                        Approved
                    </SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
            </Select>

            {/* SORT */}
            <Select value={sort} onValueChange={onSortChange}>
                <SelectTrigger className="w-56">
                    <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="date_desc">Newest first</SelectItem>
                    <SelectItem value="date_asc">Oldest first</SelectItem>
                    <SelectItem value="name_asc">Name A → Z</SelectItem>
                    <SelectItem value="name_desc">Name Z → A</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
