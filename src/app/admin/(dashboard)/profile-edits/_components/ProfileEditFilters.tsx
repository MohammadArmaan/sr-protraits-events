"use client";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { ProfileEditStatus } from "@/types/admin/profile-edit";

export type ProfileEditSort =
    | "date_desc"
    | "date_asc"
    | "name_asc"
    | "name_desc";

interface Props {
    sort: ProfileEditSort;
    status: ProfileEditStatus;
    onSortChange: (v: ProfileEditSort) => void;
    onStatusChange: (v: ProfileEditStatus) => void;
}

export function ProfileEditFilters({
    sort,
    status,
    onSortChange,
    onStatusChange,
}: Props) {
    return (
        <div className="flex gap-4 flex-wrap">
            {/* STATUS FILTER */}
            <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-44">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
            </Select>

            {/* SORT */}
            <Select value={sort} onValueChange={onSortChange}>
                <SelectTrigger className="w-56">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="date_desc">
                        Newest first
                    </SelectItem>
                    <SelectItem value="date_asc">
                        Oldest first
                    </SelectItem>
                    <SelectItem value="name_asc">
                        Vendor A → Z
                    </SelectItem>
                    <SelectItem value="name_desc">
                        Vendor Z → A
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
