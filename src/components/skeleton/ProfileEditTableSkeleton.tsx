"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    rows?: number;
}

export function ProfileEditTableSkeleton({
    rows = 5,
}: Props) {
    return (
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Change Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead className="text-right">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {Array.from({ length: rows }).map(
                        (_, i) => (
                            <TableRow key={i}>
                                {/* Vendor */}
                                <TableCell>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-56" />
                                    </div>
                                </TableCell>

                                {/* Change Type */}
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                        <Skeleton className="h-5 w-24 rounded-full" />
                                    </div>
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <Skeleton className="h-5 w-24 rounded-full" />
                                </TableCell>

                                {/* Date */}
                                <TableCell>
                                    <Skeleton className="h-4 w-36" />
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="text-right">
                                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                                </TableCell>
                            </TableRow>
                        )
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
