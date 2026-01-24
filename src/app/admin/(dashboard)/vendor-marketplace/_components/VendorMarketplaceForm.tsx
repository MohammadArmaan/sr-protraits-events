"use client";

import { useEffect, useState } from "react";
import { Upload, X, ImagePlus, Star, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
    AdminVendorProduct,
    CreateVendorProductPayload,
    PricingUnit,
    AdvanceType,
} from "@/types/admin/vendor-products";
import Zoom from "react-medium-image-zoom";
import { useVendorListByStatus } from "@/hooks/queries/admin/useVendorListByStatus";

/* -------------------------------------------------------------------------- */
/*                                FORM STATE                                  */
/* -------------------------------------------------------------------------- */

interface VendorProductFormState {
    vendorId: number | null;

    title: string;
    description: string;

    images: string[];
    featuredImageIndex: number;

    basePriceSingleDay: number;
    basePriceMultiDay: number;
    pricingUnit: PricingUnit;

    advanceType: AdvanceType;
    advanceValue: number | null;

    isFeatured: boolean;
    isActive: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                   PROPS                                    */
/* -------------------------------------------------------------------------- */

interface Props {
    initialData?: AdminVendorProduct | null;
    onSubmit: (payload: CreateVendorProductPayload) => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/*                            COMPONENT START                                 */
/* -------------------------------------------------------------------------- */

export function VendorMarketplaceForm({ initialData, onSubmit }: Props) {
    const router = useRouter();

    /* ---------------- FETCH ONLY ACTIVE VENDORS ---------------- */
    const { data, isLoading } = useVendorListByStatus("ACTIVE");
    const vendors = data?.vendors ?? [];

    /* ---------------- FORM MODE ---------------- */
    const isEditMode = Boolean(initialData);

    const [useCustomContent, setUseCustomContent] = useState<boolean>(
        Boolean(initialData),
    );

    /* ---------------- FORM STATE ---------------- */
    const [form, setForm] = useState<VendorProductFormState>({
        vendorId: initialData?.vendorId ?? null,

        title: initialData?.title ?? "",
        description: initialData?.description ?? "",

        images: initialData?.images ?? [],
        featuredImageIndex: initialData?.featuredImageIndex ?? 0,

        basePriceSingleDay: initialData?.basePriceSingleDay ?? 0,
        basePriceMultiDay: initialData?.basePriceMultiDay ?? 0,
        pricingUnit: initialData?.pricingUnit ?? "PER_DAY",

        advanceType: initialData?.advanceType ?? "FIXED",
        advanceValue: initialData?.advanceValue ?? null,

        isFeatured: initialData?.isFeatured ?? false,
        isActive: initialData?.isActive ?? true,
    });

    /* ---------------- SELECTED VENDOR ---------------- */
    const selectedVendor = vendors.find((v) => v.vendorId === form.vendorId);

    /* ---------------------------------------------------------------------- */
    /*                      AUTO-FILL FROM VENDOR PROFILE                     */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!selectedVendor) return;
        if (useCustomContent) return;
        if (isEditMode) return;

        setForm((prev) => ({
            ...prev,
            title: selectedVendor.businessName,
            description: selectedVendor.businessDescription ?? "",
            images: selectedVendor.businessPhotos ?? [],
            featuredImageIndex: 0,
        }));
        console.log(
            selectedVendor.businessName,
            selectedVendor.businessDescription,
            selectedVendor.businessPhotos,
        );
    }, [selectedVendor, useCustomContent, isEditMode]);

    /* ---------------------------------------------------------------------- */
    /*                              IMAGE LOGIC                                */
    /* ---------------------------------------------------------------------- */

    const addCustomImage = () => {
        const url = prompt("Enter image URL");
        if (!url) return;

        setForm((prev) => ({
            ...prev,
            images: [...prev.images, url],
        }));
    };

    const addVendorPhoto = (photo: string) => {
        if (form.images.includes(photo)) return;

        setForm((prev) => ({
            ...prev,
            images: [...prev.images, photo],
        }));
    };

    const removeImage = (index: number) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
            featuredImageIndex:
                prev.featuredImageIndex === index
                    ? 0
                    : prev.featuredImageIndex > index
                      ? prev.featuredImageIndex - 1
                      : prev.featuredImageIndex,
        }));
    };

    /* ---------------------------------------------------------------------- */
    /*                                SUBMIT                                   */
    /* ---------------------------------------------------------------------- */

    const handleSubmit = async () => {
        if (!form.vendorId) {
            toast.error("Please select a vendor");
            return;
        }

        if (!form.images.length) {
            toast.error("At least one image is required");
            return;
        }

        if (form.basePriceSingleDay <= 0 || form.basePriceMultiDay <= 0) {
            toast.error("Prices must be greater than zero");
            return;
        }

        const payload: CreateVendorProductPayload = {
            vendorId: form.vendorId,

            title: form.title,
            description: form.description || undefined,

            images: form.images,
            featuredImageIndex: form.featuredImageIndex,

            basePriceSingleDay: form.basePriceSingleDay,
            basePriceMultiDay: form.basePriceMultiDay,
            pricingUnit: form.pricingUnit,

            advanceType: form.advanceType,
            advanceValue: form.advanceValue ?? undefined,

            isFeatured: form.isFeatured,
            isActive: form.isActive,
        };

        await onSubmit(payload);
    };

    /* ---------------------------------------------------------------------- */
    /*                                  UI                                     */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="space-y-6">
            {/* ---------------- PAGE HEADER ---------------- */}
            <div className="flex items-start gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push("/admin/vendor-marketplace")}
                    className="shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">
                        {isEditMode ? "Edit Listing" : "Create New Listing"}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isEditMode
                            ? "Update vendor listing details and settings"
                            : "Add a new vendor to the marketplace"}
                    </p>
                </div>
            </div>

            {/* ---------------- VENDOR SELECT ---------------- */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Vendor Selection</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label>Select Vendor</Label>
                    <Select
                        value={form.vendorId?.toString() ?? ""}
                        onValueChange={(v) =>
                            setForm((prev) => ({
                                ...prev,
                                vendorId: Number(v),
                            }))
                        }
                        disabled={isEditMode}
                    >
                        <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Choose vendor..." />
                        </SelectTrigger>
                        <SelectContent>
                            {vendors.map((v) => (
                                <SelectItem
                                    key={v.vendorId}
                                    value={String(v.vendorId)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {v.fullName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {v.occupation} • {v.businessName}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* ---------------- AUTO FILL TOGGLE ---------------- */}
                    {selectedVendor && !isEditMode && (
                        <div className="mt-4 p-4 border-2 border-dashed rounded-lg bg-muted/30">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">
                                        Use vendor business info
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Auto-fill title, description & images
                                    </p>
                                </div>
                                <Switch
                                    checked={!useCustomContent}
                                    onCheckedChange={(v) =>
                                        setUseCustomContent(!v)
                                    }
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ---------------- LISTING DETAILS ---------------- */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Listing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Listing Title</Label>
                        <Input
                            value={form.title}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                            disabled={
                                !useCustomContent &&
                                !!selectedVendor &&
                                !isEditMode
                            }
                            className="mt-1.5"
                        />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            disabled={
                                !useCustomContent &&
                                !!selectedVendor &&
                                !isEditMode
                            }
                            className="mt-1.5"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ---------------- PRICING ---------------- */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Pricing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Single Day Price (₹)</Label>
                            <Input
                                type="number"
                                value={form.basePriceSingleDay}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        basePriceSingleDay: Number(
                                            e.target.value,
                                        ),
                                    }))
                                }
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label>Multi Day Price (₹)</Label>
                            <Input
                                type="number"
                                value={form.basePriceMultiDay}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        basePriceMultiDay: Number(
                                            e.target.value,
                                        ),
                                    }))
                                }
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                        <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="mb-1.5 block">Advance Payment</Label>
                            <Select
                                value={form.advanceType}
                                onValueChange={(v) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        advanceType: v as AdvanceType,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FIXED">
                                        Fixed Amount
                                    </SelectItem>
                                    <SelectItem value="PERCENTAGE">
                                        Percentage
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            </div>
                            <div>
                                <Label>Advance Value (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder={
                                        form.advanceType === "PERCENTAGE"
                                            ? "%"
                                            : "₹"
                                    }
                                    value={form.advanceValue ?? ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            advanceValue:
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value),
                                        }))
                                    }
                                />
                            </div>
                    </div>
                </CardContent>
            </Card>

            {/* ---------------- IMAGES ---------------- */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Product Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {selectedVendor?.businessPhotos?.length ? (
                        <div>
                            <Label className="mb-2 block">
                                Vendor Business Photos
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {selectedVendor.businessPhotos.map((img, i) => {
                                    const added = form.images.includes(img);
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={added}
                                            onClick={() => addVendorPhoto(img)}
                                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                                added
                                                    ? "border-primary opacity-50 cursor-not-allowed"
                                                    : "border-border hover:border-primary hover:shadow-md"
                                            }`}
                                        >
                                            <Zoom>

                                            <img
                                                src={img}
                                                alt={`Vendor photo ${i + 1}`}
                                                className="w-full h-full object-cover"
                                                />
                                                </Zoom>
                                            {!added && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <ImagePlus className="h-5 w-5 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    <div>
                        <Label className="mb-2 block">Selected Images</Label>
                        <div className="grid grid-cols-3 gap-4">
                            {form.images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${
                                        i === form.featuredImageIndex
                                            ? "border-primary ring-2 ring-primary/20 shadow-lg"
                                            : "border-border hover:border-primary"
                                    }`}
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            featuredImageIndex: i,
                                        }))
                                    }
                                >

                                    <img
                                        src={img}
                                        alt={`Product image ${i + 1}`}
                                        className="h-32 w-full object-cover"
                                        />

                                    {/* Featured Badge */}
                                    {i === form.featuredImageIndex && (
                                        <div className="absolute top-2 left-2 bg-gradient-primary text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-current" />
                                            Featured
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(i);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            ))}

                            {/* Add Image Button */}
                            <button
                                type="button"
                                onClick={addCustomImage}
                                className="h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all hover:bg-primary/5"
                            >
                                <Upload className="h-6 w-6 mb-2" />
                                <span className="text-sm font-medium">
                                    Add Image
                                </span>
                            </button>
                        </div>
                        {form.images.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Click on an image to set it as featured
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ---------------- SETTINGS ---------------- */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Listing Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-8">
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={form.isActive}
                                onCheckedChange={(v) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        isActive: v,
                                    }))
                                }
                            />
                            <div>
                                <Label className="cursor-pointer">Active</Label>
                                <p className="text-xs text-muted-foreground">
                                    Visible in marketplace
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={form.isFeatured}
                                onCheckedChange={(v) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        isFeatured: v,
                                    }))
                                }
                            />
                            <div>
                                <Label className="cursor-pointer">
                                    Featured
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Show in featured section
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ---------------- SUBMIT ---------------- */}
            <div className="flex gap-4">
                <Button
                    onClick={handleSubmit}
                    className="bg-gradient-primary flex-1"
                >
                    {isEditMode ? "Update Listing" : "Create Listing"}
                </Button>
            </div>
        </div>
    );
}
