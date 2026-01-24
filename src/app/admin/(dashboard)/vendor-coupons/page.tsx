"use client";

import { useState } from "react";
import { Plus, MoreVertical, Eye, Pencil, Trash2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { useAdminVendorCoupons } from "@/hooks/queries/admin/vendor-coupons/useAdminVendorCoupons";
import { useCreateVendorCoupon } from "@/hooks/queries/admin/vendor-coupons/useCreateVendorCoupon";
import { useUpdateVendorCoupon } from "@/hooks/queries/admin/vendor-coupons/useUpdateVendorCoupon";
import { useDeleteVendorCoupon } from "@/hooks/queries/admin/vendor-coupons/useDeleteVendorCoupon";
import {
    VendorCoupon,
    VendorCouponFormPayload,
} from "@/types/admin/vendor-cupon";
import { CouponForm } from "./_components/CouponForm";
import { CouponTableSkeleton } from "@/components/skeleton/CouponTableSkeleton";

export default function AdminVendorCouponsPage() {
    const { data, isLoading } = useAdminVendorCoupons();
    const createMutation = useCreateVendorCoupon();
    const updateMutation = useUpdateVendorCoupon();
    const deleteMutation = useDeleteVendorCoupon();

    const coupons = data?.coupons ?? [];

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<VendorCoupon | null>(
        null,
    );
    const [viewingCoupon, setViewingCoupon] = useState<VendorCoupon | null>(
        null,
    );

    const handleCreate = () => {
        setEditingCoupon(null);
        setIsFormOpen(true);
    };

    const handleEdit = (coupon: VendorCoupon) => {
        setEditingCoupon(coupon);
        setIsFormOpen(true);
    };

    const handleDelete = async (coupon: VendorCoupon) => {
        await deleteMutation.mutateAsync(coupon.id);
        toast.success(`Coupon "${coupon.code}" deleted`);
    };

    const handleSubmit = async (payload: VendorCouponFormPayload) => {
        if (editingCoupon) {
            await updateMutation.mutateAsync({
                id: editingCoupon.id,
                payload,
            });
            toast.success("Coupon updated successfully");
        } else {
            await createMutation.mutateAsync(payload);
            toast.success("Coupon created successfully");
        }
        setIsFormOpen(false);
    };

    const getTypeLabel = (type: VendorCoupon["type"]) => {
        switch (type) {
            case "FLAT":
                return "Flat Discount";
            case "PERCENT":
                return "Percentage";
            case "UPTO":
                return "Up To (Max Cap)";
        }
    };

    const getValueDisplay = (coupon: VendorCoupon) => {
        const value = Number(coupon.value);
        if (coupon.type === "FLAT") return `₹${value}`;
        if (coupon.type === "PERCENT") return `${value}%`;
        return `${value}% (Max ₹${coupon.maxDiscount})`;
    };

    const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

    if (isLoading) {
        return <CouponTableSkeleton />;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <PageHeader
                    title="Coupon Management"
                    description="Create and manage discount coupons for vendors"
                />
                <Button
                    onClick={handleCreate}
                    className="bg-gradient-primary text-primary-foreground"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Coupon
                </Button>
            </div>

            <div className="bg-card rounded-lg shadow-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Coupon Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Expires On</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {coupons.map((coupon) => (
                            <TableRow
                                key={coupon.id}
                                className="transition-smooth hover:bg-muted/30"
                            >
                                <TableCell className="font-mono font-semibold text-primary">
                                    {coupon.code}
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline">
                                        {getTypeLabel(coupon.type)}
                                    </Badge>
                                </TableCell>

                                <TableCell className="font-medium">
                                    {getValueDisplay(coupon)}
                                </TableCell>

                                <TableCell
                                    className={
                                        isExpired(coupon.expiresAt)
                                            ? "text-destructive"
                                            : ""
                                    }
                                >
                                    {new Date(
                                        coupon.expiresAt,
                                    ).toLocaleDateString()}
                                </TableCell>

                                <TableCell>
                                    {!coupon.isActive ? (
                                        <Badge variant="secondary">
                                            Inactive
                                        </Badge>
                                    ) : isExpired(coupon.expiresAt) ? (
                                        <Badge variant="destructive">
                                            Expired
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-success text-success-foreground">
                                            Active
                                        </Badge>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setViewingCoupon(coupon)
                                                }
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleEdit(coupon)
                                                }
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDelete(coupon)
                                                }
                                                className="text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create / Edit */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-primary" />
                            {editingCoupon
                                ? "Edit Coupon"
                                : "Create New Coupon"}
                        </DialogTitle>
                    </DialogHeader>

                    <CouponForm
                        coupon={editingCoupon}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* View */}
            <Dialog
                open={!!viewingCoupon}
                onOpenChange={() => setViewingCoupon(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-primary" />
                            Coupon Details
                        </DialogTitle>
                    </DialogHeader>

                    {viewingCoupon && (
                        <div className="space-y-4">
                            <div className="text-center py-4 bg-muted rounded-lg">
                                <p className="text-3xl font-mono font-bold text-primary">
                                    {viewingCoupon.code}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <Detail
                                    label="Type"
                                    value={getTypeLabel(viewingCoupon.type)}
                                />
                                <Detail
                                    label="Discount"
                                    value={getValueDisplay(viewingCoupon)}
                                />
                                <Detail
                                    label="Expires"
                                    value={new Date(
                                        viewingCoupon.expiresAt,
                                    ).toLocaleString()}
                                />
                                <Detail
                                    label="Status"
                                    value={
                                        !viewingCoupon.isActive
                                            ? "Inactive"
                                            : isExpired(viewingCoupon.expiresAt)
                                              ? "Expired"
                                              : "Active"
                                    }
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}
