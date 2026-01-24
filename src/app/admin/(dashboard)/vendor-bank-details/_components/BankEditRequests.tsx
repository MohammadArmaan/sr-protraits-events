"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Check, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { REGISTRATION_PAGE_SIZE } from "@/lib/admin/constants";

import { useBankDetailsEditList } from "@/hooks/queries/admin/useBankDetailsEditList";

import {
    VendorBankDetailsEditRequest,
} from "@/types/admin/vendor-bank-details";

import { useApproveBankDetailsEdit } from "@/hooks/queries/admin/useApproveBankDetailsEdit";
import { useRejectBankDetailsEdit } from "@/hooks/queries/admin/useRejectBankDetailsEdit";
import { BankEditFilters, BankEditSort } from "./BankEditFilters";
import { BankPagination } from "./BankPagination";

const DEFAULT_SORT: BankEditSort = "date_desc";


export default function BankEditRequests() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const sort =
        (searchParams.get("sort") as BankEditSort) ??
        DEFAULT_SORT;

    const page = Number(searchParams.get("page") ?? 1);

    const { data, isLoading } = useBankDetailsEditList();
    const approve = useApproveBankDetailsEdit();
    const reject = useRejectBankDetailsEdit();

    const [selected, setSelected] =
        useState<VendorBankDetailsEditRequest | null>(
            null
        );

    /* -------- URL normalize -------- */
    useEffect(() => {
        const params = new URLSearchParams(
            searchParams.toString()
        );
        let changed = false;

        if (!params.get("sort")) {
            params.set("sort", DEFAULT_SORT);
            changed = true;
        }
        if (!params.get("page")) {
            params.set("page", "1");
            changed = true;
        }

        if (changed) {
            router.replace(`?${params.toString()}`);
        }
    }, [searchParams, router]);

    /* -------- filter + sort + paginate -------- */
    const {
        paginated,
        totalPages,
        totalCount,
    } = useMemo(() => {
        if (!data?.vendors)
            return {
                paginated: [],
                totalPages: 1,
                totalCount: 0,
            };

        const list = [...data.vendors];

        switch (sort) {
            case "name_asc":
                list.sort((a, b) =>
                    a.accountHolderName.localeCompare(
                        b.accountHolderName
                    )
                );
                break;
            case "name_desc":
                list.sort((a, b) =>
                    b.accountHolderName.localeCompare(
                        a.accountHolderName
                    )
                );
                break;
            case "date_asc":
                list.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                );
                break;
            case "date_desc":
                list.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
                break;
        }

        const totalCount = list.length;
        const totalPages = Math.max(
            1,
            Math.ceil(
                totalCount / REGISTRATION_PAGE_SIZE
            )
        );

        const start =
            (page - 1) * REGISTRATION_PAGE_SIZE;

        return {
            paginated: list.slice(
                start,
                start + REGISTRATION_PAGE_SIZE
            ),
            totalPages,
            totalCount,
        };
    }, [data, sort, page]);

    const updateQuery = (key: string, val: string) => {
        const params = new URLSearchParams(
            searchParams.toString()
        );
        params.set(key, val);
        if (key !== "page") params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    /* -------- actions -------- */
    const handleApprove = (vendorId: number) => {
        approve.mutate(
            { vendorId },
            {
                onSuccess: () => {
                    toast.success(
                        "Bank details approved"
                    );
                    setSelected(null);
                },
            }
        );
    };

    const handleReject = (vendorId: number) => {
        reject.mutate(
            { vendorId },
            {
                onSuccess: () => {
                    toast.error(
                        "Bank details rejected"
                    );
                    setSelected(null);
                },
            }
        );
    };

    /* -------- render -------- */
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Bank Details Edit Requests"
                description={`${totalCount} pending requests`}
            />

            <BankEditFilters
                sort={sort}
                onSortChange={(v) =>
                    updateQuery("sort", v)
                }
            />

            <div className="bg-card rounded-lg shadow-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead>
                                Changes Requested
                            </TableHead>
                            <TableHead>
                                Requested At
                            </TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.map((req) => (
                            <TableRow key={req.vendorId}>
                                <TableCell>
                                    <p className="font-medium">
                                        {
                                            req.accountHolderName
                                        }
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Vendor ID:{" "}
                                        {req.vendorId}
                                    </p>
                                </TableCell>

                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {req.pendingChanges?.accountHolderName && (
                                            <Badge variant="secondary">
                                                Account
                                                Name
                                            </Badge>
                                        )}
                                        {req.pendingChanges?.accountNumber && (
                                            <Badge variant="secondary">
                                                Account
                                                No
                                            </Badge>
                                        )}
                                        {req.pendingChanges?.ifscCode && (
                                            <Badge variant="secondary">
                                                IFSC
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell className="text-muted-foreground">
                                    {new Date(
                                        req.createdAt
                                    ).toLocaleString()}
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() =>
                                                setSelected(
                                                    req
                                                )
                                            }
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-success"
                                            onClick={() =>
                                                handleApprove(
                                                    req.vendorId
                                                )
                                            }
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-destructive"
                                            onClick={() =>
                                                handleReject(
                                                    req.vendorId
                                                )
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {!isLoading &&
                            paginated.length ===
                                0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        No bank edit
                                        requests
                                    </TableCell>
                                </TableRow>
                            )}
                    </TableBody>
                </Table>
            </div>

            <BankPagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) =>
                    updateQuery("page", String(p))
                }
            />

            {/* -------- Dialog -------- */}
            <Dialog
                open={!!selected}
                onOpenChange={() =>
                    setSelected(null)
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Bank Details Change
                        </DialogTitle>
                        <DialogDescription>
                            Review requested changes
                        </DialogDescription>
                    </DialogHeader>

                    {selected?.pendingChanges && (
                        <div className="space-y-3">
                            {Object.entries(
                                selected.pendingChanges
                            ).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="p-3 rounded-lg bg-muted/50"
                                    >
                                        <p className="text-xs text-muted-foreground">
                                            {key}
                                        </p>
                                        <p className="font-medium">
                                            {value}
                                        </p>
                                    </div>
                                )
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 text-destructive border-destructive"
                                    onClick={() =>
                                        handleReject(
                                            selected.vendorId
                                        )
                                    }
                                >
                                    Reject
                                </Button>
                                <Button
                                    className="flex-1 bg-gradient-primary"
                                    onClick={() =>
                                        handleApprove(
                                            selected.vendorId
                                        )
                                    }
                                >
                                    Approve
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
