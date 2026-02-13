"use client";

import { useEffect, useState } from "react";
import { Upload, X, Star, ArrowLeft, Check } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

import {
    AdminVendorProduct,
    CreateVendorProductPayload,
    PricingUnit,
    AdvanceType,
} from "@/types/admin/vendor-products";
import Zoom from "react-medium-image-zoom";
import { useVendorListByStatus } from "@/hooks/queries/admin/useVendorListByStatus";

/* -------------------------------------------------------------------------- */
/*                            CATALOG INTERFACE                               */
/* -------------------------------------------------------------------------- */

interface CatalogImage {
    id: number;
    catalogId: number;
    imageUrl: string;
    sortOrder: number;
}

interface VendorCatalog {
    id: number;
    vendorId: number;
    title: string;
    description: string | null;
    categoryId: number;
    subCategoryId: number | null;
    images: CatalogImage[];
    createdAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                                FORM STATE                                  */
/* -------------------------------------------------------------------------- */

interface VendorProductFormState {
    vendorId: number | null;
    catalogIds: number[];
    featuredImageByCatalog: Record<number, number>; // catalogId -> imageId

    title: string;
    description: string;

    isSessionBased: boolean;

    basePriceSingleDay: number;
    basePriceMultiDay: number;

    pricingUnit: PricingUnit;

    advanceType: AdvanceType;
    advanceValue: number | null;

    isFeatured: boolean;
    isPriority: boolean;
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
    const [isHydrated, setIsHydrated] = useState(false);
    const [useCustomContent, setUseCustomContent] = useState<boolean>(
        Boolean(initialData),
    );

    /* ---------------- FORM STATE ---------------- */
    const [form, setForm] = useState<VendorProductFormState>({
        vendorId: initialData?.vendorId ?? null,
        catalogIds: [],
        featuredImageByCatalog: {},

        title: initialData?.title ?? "",
        description: initialData?.description ?? "",

        isSessionBased: initialData?.isSessionBased ?? false,

        basePriceSingleDay: initialData?.basePriceSingleDay ?? 0,
        basePriceMultiDay: initialData?.basePriceMultiDay ?? 0,

        pricingUnit: initialData?.pricingUnit ?? "PER_DAY",

        advanceType: initialData?.advanceType ?? "FIXED",
        advanceValue: initialData?.advanceValue ?? null,

        isFeatured: initialData?.isFeatured ?? false,
        isPriority: initialData?.isPriority ?? false,
        isActive: initialData?.isActive ?? true,
    });

    /* ---------------- VENDOR CATALOGS STATE ---------------- */
    const [vendorCatalogs, setVendorCatalogs] = useState<VendorCatalog[]>([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(false);

    /* ---------------- SELECTED VENDOR ---------------- */
    const selectedVendor = vendors.find((v) => v.vendorId === form.vendorId);

    /* ---------------- SELECTED CATALOGS ---------------- */
    const selectedCatalogs = vendorCatalogs.filter((c) =>
        form.catalogIds.includes(c.id),
    );

    /* ---------------------------------------------------------------------- */
    /*                      FETCH VENDOR CATALOGS                             */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!form.vendorId) {
            setVendorCatalogs([]);
            return;
        }

        const fetchCatalogs = async () => {
            setLoadingCatalogs(true);
            try {
                const res = await fetch(
                    `/api/admin/vendor-catalogs?vendorId=${form.vendorId}`,
                );
                if (res.ok) {
                    const data = await res.json();
                    setVendorCatalogs(data.catalogs || []);
                }
            } catch (error) {
                console.error("Failed to fetch catalogs:", error);
                toast.error("Failed to load vendor catalogs");
            } finally {
                setLoadingCatalogs(false);
            }
        };

        fetchCatalogs();
    }, [form.vendorId]);

    /* ---------------------------------------------------------------------- */
    /*                    HYDRATE EDIT MODE DATA                              */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!isEditMode || !initialData?.id) return;
        if (vendorCatalogs.length === 0) return; // Wait for catalogs to load first

        const hydrateEditData = async () => {
            try {
                const res = await fetch(
                    `/api/admin/vendor-products/${initialData.id}/details`,
                );
                const data = await res.json();

                if (!data.success) return;

                // Map featured image URLs to catalog image IDs
                const featuredImageByCatalog: Record<number, number> = {};

                Object.entries(data.imagesByCatalog).forEach(
                    ([catalogId, group]: [string, any]) => {
                        // Use featuredImageUrl instead of featuredImageId
                        if (!group.featuredImageUrl) return;

                        // Find the matching catalog from vendorCatalogs
                        const catalog = vendorCatalogs.find(
                            (c) => c.id === Number(catalogId),
                        );

                        if (!catalog) return;

                        // Find the catalog image with matching URL
                        const matchingCatalogImage = catalog.images.find(
                            (img) => img.imageUrl === group.featuredImageUrl,
                        );

                        if (matchingCatalogImage) {
                            featuredImageByCatalog[Number(catalogId)] =
                                matchingCatalogImage.id;
                        }
                    },
                );

                setForm((prev) => ({
                    ...prev,
                    catalogIds: data.catalogIds,
                    featuredImageByCatalog: featuredImageByCatalog,
                }));
                setIsHydrated(true);
            } catch (err) {
                console.error("Hydration error:", err);
                toast.error("Failed to load product catalogs");
            }
        };

        hydrateEditData();
    }, [isEditMode, initialData?.id, vendorCatalogs.length]);

    /* ---------------------------------------------------------------------- */
    /*                      AUTO-FILL FROM CATALOGS                           */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (form.catalogIds.length === 0) return;
        if (useCustomContent) return;
        if (isEditMode) return;
        if (vendorCatalogs.length === 0) return;

        const selected = vendorCatalogs.filter((c) =>
            form.catalogIds.includes(c.id),
        );

        if (selected.length === 0) return;

        const firstCatalog = selected[0];
        const newTitle =
            firstCatalog.title || selectedVendor?.businessName || "";
        const newDescription =
            firstCatalog.description ||
            selectedVendor?.businessDescription ||
            "";

        setForm((prev) => {
            const titleChanged = prev.title !== newTitle;
            const descriptionChanged = prev.description !== newDescription;

            if (!titleChanged && !descriptionChanged) {
                return prev;
            }

            return {
                ...prev,
                title: newTitle,
                description: newDescription,
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.catalogIds.join(","), useCustomContent, isEditMode]);

    /* ---------------------------------------------------------------------- */
    /*                    SESSION-BASED PRICING LOGIC                         */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (form.isSessionBased) {
            setForm((prev) => {
                if (prev.pricingUnit === "PER_EVENT") return prev;
                return {
                    ...prev,
                    pricingUnit: "PER_EVENT",
                };
            });
        } else {
            setForm((prev) => {
                if (prev.pricingUnit === "PER_DAY") return prev;
                return {
                    ...prev,
                    pricingUnit: "PER_DAY",
                };
            });
        }
    }, [form.isSessionBased]);

    /* ---------------------------------------------------------------------- */
    /*                         CATALOG SELECTION                              */
    /* ---------------------------------------------------------------------- */

    const toggleCatalog = (catalogId: number) => {
        setForm((prev) => {
            const isRemoving = prev.catalogIds.includes(catalogId);

            if (isRemoving) {
                // Remove catalog and its featured image
                const newFeatured = { ...prev.featuredImageByCatalog };
                delete newFeatured[catalogId];

                return {
                    ...prev,
                    catalogIds: prev.catalogIds.filter(
                        (id) => id !== catalogId,
                    ),
                    featuredImageByCatalog: newFeatured,
                };
            } else {
                // Add catalog
                return {
                    ...prev,
                    catalogIds: [...prev.catalogIds, catalogId],
                };
            }
        });
    };

    /* ---------------------------------------------------------------------- */
    /*                         FEATURED IMAGE SELECTION                       */
    /* ---------------------------------------------------------------------- */

    const setFeaturedImageForCatalog = (catalogId: number, imageId: number) => {
        setForm((prev) => ({
            ...prev,
            featuredImageByCatalog: {
                ...prev.featuredImageByCatalog,
                [catalogId]: imageId,
            },
        }));
    };

    /* ---------------------------------------------------------------------- */
    /*                              IMAGE LOGIC                                */
    /* ---------------------------------------------------------------------- */

    const addCustomImage = () => {
        const url = prompt("Enter image URL");
        if (!url) return;
        toast.info(
            "Custom images are not supported in this version. Please use catalog images.",
        );
    };

    /* ---------------------------------------------------------------------- */
    /*                                SUBMIT                                   */
    /* ---------------------------------------------------------------------- */

    const handleSubmit = async () => {
        if (!form.vendorId) {
            toast.error("Please select a vendor");
            return;
        }

        if (form.catalogIds.length === 0) {
            toast.error("Please select at least one catalog");
            return;
        }

        // Check if all catalogs have featured images
        for (const catalogId of form.catalogIds) {
            if (!form.featuredImageByCatalog[catalogId]) {
                const catalog = vendorCatalogs.find((c) => c.id === catalogId);
                toast.error(
                    `Please select a featured image for catalog: ${catalog?.title}`,
                );
                return;
            }
        }

        if (form.basePriceSingleDay <= 0) {
            toast.error("Session/Single day price must be greater than zero");
            return;
        }

        if (!form.isSessionBased && form.basePriceMultiDay <= 0) {
            toast.error("Multi day price must be greater than zero");
            return;
        }

        const payload: CreateVendorProductPayload = {
            vendorId: form.vendorId,
            catalogIds: form.catalogIds,
            featuredImageByCatalog: form.featuredImageByCatalog,

            title: form.title,
            description: form.description || undefined,

            isSessionBased: form.isSessionBased,

            basePriceSingleDay: form.basePriceSingleDay,
            basePriceMultiDay: form.basePriceMultiDay,
            pricingUnit: form.pricingUnit,

            advanceType: form.advanceType,
            advanceValue: form.advanceValue ?? undefined,

            isFeatured: form.isFeatured,
            isPriority: form.isPriority,
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
                <CardContent className="space-y-4">
                    <div>
                        <Label>Select Vendor</Label>
                        <Select
                            value={form.vendorId?.toString() ?? ""}
                            onValueChange={(v) =>
                                setForm((prev) => ({
                                    ...prev,
                                    vendorId: Number(v),
                                    catalogIds: [],
                                    featuredImageByCatalog: {},
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
                                                {v.occupation} •{" "}
                                                {v.businessName}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ---------------- CATALOG SELECTION ---------------- */}
                    {form.vendorId && (
                        <div>
                            <Label className="mb-2 block">
                                Select Catalogs (Multiple)
                            </Label>
                            {loadingCatalogs ? (
                                <p className="text-sm text-muted-foreground">
                                    Loading catalogs...
                                </p>
                            ) : vendorCatalogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No catalogs available for this vendor
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                                    {vendorCatalogs.map((catalog) => (
                                        <div
                                            key={catalog.id}
                                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <Checkbox
                                                id={`catalog-${catalog.id}`}
                                                checked={form.catalogIds.includes(
                                                    catalog.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleCatalog(catalog.id)
                                                }
                                                disabled={
                                                    isEditMode &&
                                                    isHydrated &&
                                                    !form.catalogIds.includes(
                                                        catalog.id,
                                                    )
                                                }
                                            />
                                            <div className="flex-1">
                                                <label
                                                    htmlFor={`catalog-${catalog.id}`}
                                                    className="font-medium cursor-pointer"
                                                >
                                                    {catalog.title}
                                                </label>
                                                {catalog.description && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {catalog.description.substring(
                                                            0,
                                                            100,
                                                        )}
                                                        {catalog.description
                                                            .length > 100 &&
                                                            "..."}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {catalog.images.length}{" "}
                                                    {catalog.images.length === 1
                                                        ? "image"
                                                        : "images"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {form.catalogIds.length > 0 && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    {form.catalogIds.length} catalog
                                    {form.catalogIds.length === 1
                                        ? ""
                                        : "s"}{" "}
                                    selected
                                </p>
                            )}
                        </div>
                    )}

                    {/* ---------------- AUTO FILL TOGGLE ---------------- */}
                    {selectedCatalogs.length > 0 && !isEditMode && (
                        <div className="mt-4 p-4 border-2 border-dashed rounded-lg bg-muted/30">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">
                                        Use catalog content
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Auto-fill title & description from
                                        selected catalogs
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
                                selectedCatalogs.length > 0 &&
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
                                selectedCatalogs.length > 0 &&
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
                    {/* Session-Based Toggle */}
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                        <Switch
                            checked={form.isSessionBased}
                            onCheckedChange={(v) =>
                                setForm((prev) => ({
                                    ...prev,
                                    isSessionBased: v,
                                }))
                            }
                        />
                        <div>
                            <Label className="cursor-pointer">
                                Session-Based Pricing
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Enable for hourly/session pricing (disables
                                multi-day pricing)
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>
                                {form.isSessionBased
                                    ? "Session Price (₹)"
                                    : "Single Day Price (₹)"}
                            </Label>
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
                        {!form.isSessionBased && (
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
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1.5 block">
                                Advance Payment
                            </Label>
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
                            <Label>Advance Value</Label>
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
                                className="mt-1.5"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ---------------- CATALOG IMAGES WITH FEATURED SELECTION ---------------- */}
            {!loadingCatalogs && selectedCatalogs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Catalog Images - Select Featured Image Per Catalog
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {selectedCatalogs.map((catalog) => (
                            <div
                                key={catalog.id}
                                className="border rounded-lg p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">
                                            {catalog.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Select one image as featured for
                                            this catalog
                                        </p>
                                    </div>
                                    {form.featuredImageByCatalog[
                                        catalog.id
                                    ] && (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <Check className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                Featured selected
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-3">
                                    {catalog.images.map((img) => {
                                        const isFeatured =
                                            form.featuredImageByCatalog[
                                                catalog.id
                                            ] === img.id;

                                        return (
                                            <button
                                                key={img.id}
                                                type="button"
                                                onClick={() =>
                                                    setFeaturedImageForCatalog(
                                                        catalog.id,
                                                        img.id,
                                                    )
                                                }
                                                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                                    isFeatured
                                                        ? "border-primary ring-2 ring-primary/20 shadow-lg"
                                                        : "border-border hover:border-primary"
                                                }`}
                                            >
                                                <Zoom>
                                                    <img
                                                        src={img.imageUrl}
                                                        alt={`${catalog.title} - Image ${img.sortOrder}`}
                                                        className="w-full h-24 object-cover"
                                                    />
                                                </Zoom>

                                                {isFeatured && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <div className="bg-primary text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-current" />
                                                            Featured
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* ---------------- SETTINGS ---------------- */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Listing Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-8 flex-wrap">
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
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={form.isPriority}
                                onCheckedChange={(v) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        isPriority: v,
                                    }))
                                }
                            />
                            <div>
                                <Label className="cursor-pointer">
                                    Priority
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    High priority listing
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