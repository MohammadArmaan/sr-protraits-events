"use client";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

export type BankEditSort =
    | "date_desc"
    | "date_asc"
    | "name_asc"
    | "name_desc";

interface Props {
    sort: BankEditSort;
    onSortChange: (val: BankEditSort) => void;
}

export function BankEditFilters({ sort, onSortChange }: Props) {
    return (
        <div className="flex gap-4">
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
