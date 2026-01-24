"use client";

import { useRouter } from "next/navigation";
import { Eye, Check, X, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ProfileEditRequest } from "@/types/admin/profile-edit";
import { useApproveProfileEdit } from "@/hooks/queries/admin/useApproveProfileEdit";
import { useRejectProfileEdit } from "@/hooks/queries/admin/useRejectProfileEdit";
import { ProfileEditTableSkeleton } from "@/components/skeleton/ProfileEditTableSkeleton";

interface Props {
    edits: ProfileEditRequest[];
    isLoading: boolean;
}

export function ProfileEditTable({ edits, isLoading }: Props) {
    const router = useRouter();
    const approve = useApproveProfileEdit();
    const reject = useRejectProfileEdit();

    if (isLoading) {
        return <ProfileEditTableSkeleton />;
    }

    return (
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Change Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {edits.map((edit) => {
                        const hasPhotoChange =
                            edit.oldProfilePhotoUrl !== edit.newProfilePhotoUrl;

                        const hasOtherChanges =
                            Object.keys(edit.changes || {}).length > 0;

                        return (
                            <TableRow key={edit.editId}>
                                {/* Vendor */}
                                <TableCell>
                                    <div>
                                        <p className="font-medium">
                                            {edit.vendorName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {edit.vendorBusinessName}
                                        </p>
                                    </div>
                                </TableCell>

                                {/* Change Type */}
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {hasPhotoChange && (
                                            <Badge variant="secondary">
                                                Profile Photo
                                            </Badge>
                                        )}
                                        {hasOtherChanges && (
                                            <Badge variant="secondary">
                                                Profile Info
                                            </Badge>
                                        )}
                                        {!hasPhotoChange &&
                                            !hasOtherChanges && (
                                                <Badge variant="secondary">
                                                    Misc
                                                </Badge>
                                            )}
                                    </div>
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <Badge
                                        variant={
                                            edit.status === "PENDING"
                                                ? "secondary"
                                                : edit.status === "APPROVED"
                                                  ? "default"
                                                  : "destructive"
                                        }
                                    >
                                        {edit.status}
                                    </Badge>
                                </TableCell>

                                {/* Date */}
                                <TableCell className="text-muted-foreground">
                                    {new Date(edit.createdAt).toLocaleString()}
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    router.push(
                                                        `/admin/profile-edits/${edit.editId}`,
                                                    )
                                                }
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                See Details
                                            </DropdownMenuItem>

                                            {edit.status === "PENDING" && (
                                                <>
                                                    <DropdownMenuItem
                                                        className="text-success focus:text-success"
                                                        onClick={() =>
                                                            approve.mutate(
                                                                {
                                                                    editId: edit.editId,
                                                                },
                                                                {
                                                                    onSuccess:
                                                                        () =>
                                                                            toast.success(
                                                                                "Profile edit approved",
                                                                            ),
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Approve
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() =>
                                                            reject.mutate(
                                                                {
                                                                    editId: edit.editId,
                                                                },
                                                                {
                                                                    onSuccess:
                                                                        () =>
                                                                            toast.error(
                                                                                "Profile edit rejected",
                                                                            ),
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}

                    {!isLoading && edits.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center py-8 text-muted-foreground"
                            >
                                No profile edit requests
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
