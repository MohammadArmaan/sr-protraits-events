// src/app/admin/vendor-registration/_components/VendorRegistrationTable.tsx
"use client";

import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VendorRegistration } from "@/types/admin/vendor-registration";
import { toast } from "sonner";
import { useApproveVendorRegistration } from "@/hooks/queries/admin/useApproveVendorRegistration";
import { useRejectVendorRegistration } from "@/hooks/queries/admin/useRejectVendorRegistration";
import { VendorActionsMenu } from "./VendorActionsMenu";
import { VendorRegistrationTableSkeleton } from "@/components/skeleton/VendorRegistrationTableSkeleton";
import Zoom from "react-medium-image-zoom";

interface Props {
    vendors: VendorRegistration[];
    isLoading: boolean;
    error?: string;
}

export function VendorRegistrationTable({ vendors, isLoading, error }: Props) {
    const router = useRouter();
    const approve = useApproveVendorRegistration();
    const reject = useRejectVendorRegistration();

    if (isLoading) {
        return <VendorRegistrationTableSkeleton />;
    }

    if (error) {
        return <div className="p-6 text-destructive">{error}</div>;
    }

    return (
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Occupation</TableHead>
                        <TableHead className="min-w-[140px]">
                            Phone No
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {vendors.map((vendor) => (
                        <TableRow key={vendor.vendorId}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <Zoom>
                                            <AvatarImage
                                                src={vendor.profilePhoto}
                                            />
                                        </Zoom>
                                        <AvatarFallback className="bg-gradient-primary text-white">
                                            {vendor.fullName
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    {vendor.fullName}
                                </div>
                            </TableCell>

                            <TableCell>{vendor.businessName}</TableCell>
                            <TableCell>{vendor.occupation}</TableCell>
                            <TableCell className="whitespace-nowrap">
                                {vendor.phone || (
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </TableCell>

                            <TableCell>
                                <Badge
                                    variant={
                                        vendor.status === "REJECTED"
                                            ? "destructive"
                                            : "secondary"
                                    }
                                >
                                    {vendor.status}
                                </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                                <VendorActionsMenu
                                    status={vendor.status}
                                    onAccept={() =>
                                        approve.mutate(
                                            { vendorId: vendor.vendorId },
                                            {
                                                onSuccess: () =>
                                                    toast.success(
                                                        "Vendor approved",
                                                    ),
                                            },
                                        )
                                    }
                                    onReject={() =>
                                        reject.mutate(
                                            { vendorId: vendor.vendorId },
                                            {
                                                onSuccess: () =>
                                                    toast.error(
                                                        "Vendor rejected",
                                                    ),
                                            },
                                        )
                                    }
                                    onViewDetails={() =>
                                        router.push(
                                            `/admin/vendor-registration/${vendor.vendorId}`,
                                        )
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ))}

                    {vendors.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center py-8 text-muted-foreground"
                            >
                                No vendors found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
