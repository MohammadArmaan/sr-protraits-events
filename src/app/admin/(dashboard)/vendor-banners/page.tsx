"use client";

import { useState } from "react";
import { Plus, MoreVertical, Eye, Pencil, Trash2, Image } from "lucide-react";
import { toast } from "sonner";

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

import { VendorBanner } from "@/types/admin/vendor-banner";
import { BannerForm } from "./_components/BannerForm";

import { useAdminVendorBanners } from "@/hooks/queries/admin/vendor-banners/useAdminVendorBanners";
import { useCreateVendorBanner } from "@/hooks/queries/admin/vendor-banners/useCreateVendorBanner";
import { useUpdateVendorBanner } from "@/hooks/queries/admin/vendor-banners/useUpdateVendorBanner";
import { useDeleteVendorBanner } from "@/hooks/queries/admin/vendor-banners/useDeleteVendorBanner";
import Zoom from "react-medium-image-zoom";
import { BannerTableSkeleton } from "@/components/skeleton/BannerTableSkeleton";

export default function AdminVendorBannersPage() {
    const { data, isLoading } = useAdminVendorBanners();
    const createMutation = useCreateVendorBanner();
    const updateMutation = useUpdateVendorBanner();
    const deleteMutation = useDeleteVendorBanner();

    const banners = data?.banners ?? [];

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<VendorBanner | null>(
        null,
    );
    const [viewingBanner, setViewingBanner] = useState<VendorBanner | null>(
        null,
    );

    const handleCreate = () => {
        setEditingBanner(null);
        setIsFormOpen(true);
    };

    const handleEdit = (banner: VendorBanner) => {
        setEditingBanner(banner);
        setIsFormOpen(true);
    };

    const handleDelete = async (banner: VendorBanner) => {
        await deleteMutation.mutateAsync(banner.id);
        toast.success("Banner deleted successfully");
    };

    const handleSubmit = async (formData: FormData) => {
        if (editingBanner) {
            await updateMutation.mutateAsync({
                id: editingBanner.id,
                formData,
            });
            toast.success("Banner updated successfully");
        } else {
            await createMutation.mutateAsync(formData);
            toast.success("Banner created successfully");
        }
        setIsFormOpen(false);
    };

    if (isLoading) {
        return <BannerTableSkeleton />;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <PageHeader
                    title="Banner Management"
                    description="Create and manage promotional banners for the vendor portal"
                />
                <Button
                    onClick={handleCreate}
                    className="bg-gradient-primary text-primary-foreground"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Banner
                </Button>
            </div>

            <div className="bg-card rounded-lg shadow-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-24">Preview</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Subtitle</TableHead>
                            <TableHead>CTA Button</TableHead>
                            <TableHead>CTA Link</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {banners.map((banner) => (
                            <TableRow
                                key={banner.id}
                                className="transition-smooth hover:bg-muted/30"
                            >
                                <TableCell>
                                    <Zoom>
                                        <img
                                            src={banner.imageUrl}
                                            alt={banner.title}
                                            className="w-20 h-12 object-cover rounded-md"
                                        />
                                    </Zoom>
                                </TableCell>

                                <TableCell className="font-medium">
                                    {banner.title}
                                </TableCell>

                                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                    {banner.subtitle}
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline">
                                        {banner.ctaText}
                                    </Badge>
                                </TableCell>

                                <TableCell>{banner.ctaLink}</TableCell>

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
                                                    setViewingBanner(banner)
                                                }
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Preview
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleEdit(banner)
                                                }
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDelete(banner)
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
                            <Image className="h-5 w-5 text-primary" />
                            {editingBanner
                                ? "Edit Banner"
                                : "Create New Banner"}
                        </DialogTitle>
                    </DialogHeader>

                    <BannerForm
                        banner={editingBanner}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Preview */}
            <Dialog
                open={!!viewingBanner}
                onOpenChange={() => setViewingBanner(null)}
            >
                <DialogContent className="max-w-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle>Banner Preview</DialogTitle>
                    </DialogHeader>

                    {viewingBanner && (
                        <>
                            <div className="relative">
                                <Zoom>
                                    <img
                                        src={viewingBanner.imageUrl}
                                        alt={viewingBanner.title}
                                        className="w-full h-64 object-cover"
                                    />
                                </Zoom>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-center items-center p-6">
                                    <h3 className="text-4xl font-bold text-white mb-2 text-center">
                                        {viewingBanner.title}
                                    </h3>
                                    <p className="text-white/80 font-bold text-center mb-4">
                                        {viewingBanner.subtitle}
                                    </p>
                                    <Button className="w-fit bg-gradient-primary rounded-full">
                                        {viewingBanner.ctaText}
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 pt-2 text-sm text-muted-foreground">
                                <p>
                                    Link:{" "}
                                    <span className="font-mono text-foreground">
                                        {viewingBanner.ctaLink}
                                    </span>
                                </p>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
