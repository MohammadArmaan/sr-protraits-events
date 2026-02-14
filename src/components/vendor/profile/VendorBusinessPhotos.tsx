"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload } from "lucide-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useVendorCatalogCategories } from "@/hooks/queries/useVendorCatalogCategories";
import { useVendorCatalogSubCategories } from "@/hooks/queries/useVendorCatalogSubCategories";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

export interface ImageItem {
    id: string;
    url: string;
    origin: "existing" | "new";
}

interface Catalog {
    catalogId?: number;
    title: string;
    images: ImageItem[];
    categoryId?: number; // ✅ ADD
    subCategoryId?: number; // ✅ ADD
}

interface Props {
    catalogs: Catalog[];
    disabled: boolean;

    onAddCatalog: () => void;
    onRemoveCatalog: (index: number) => void;

    onAddImages: (catalogIndex: number, files: File[]) => void;
    onRemoveImage: (catalogIndex: number, image: ImageItem) => void;

    onTitleChange: (catalogIndex: number, title: string) => void;

    onCategoryChange: (catalogIndex: number, categoryId: number) => void;
    onSubCategoryChange: (catalogIndex: number, subCategoryId: number) => void;
}

export default function VendorBusinessPhotos({
    catalogs,
    disabled,
    onAddCatalog,
    onRemoveCatalog,
    onAddImages,
    onRemoveImage,
    onTitleChange,
    onCategoryChange,
    onSubCategoryChange,
}: Props) {
    const { data: categories = [] } = useVendorCatalogCategories();
    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Catalogs</h2>
                <Button
                    variant="outline"
                    onClick={onAddCatalog}
                    disabled={disabled}
                >
                    + Add Catalog
                </Button>
            </div>

            {catalogs.map((catalog, catalogIdx) => (
                <div
                    key={catalog.catalogId ?? `new-${catalogIdx}`}
                    className="border rounded-2xl p-6 space-y-4"
                >
                    {/* CATEGORY SELECT */}
                    <Select
                        value={catalog.categoryId?.toString()}
                        disabled={disabled}
                        onValueChange={(value) =>
                            onCategoryChange(catalogIdx, Number(value))
                        }
                    >
                        <SelectTrigger className="w-full rounded-xl">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem
                                    key={cat.id}
                                    value={cat.id.toString()}
                                >
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* SUBCATEGORY SELECT */}
                    <SubCategorySelect
                        catalog={catalog}
                        catalogIdx={catalogIdx}
                        disabled={disabled}
                        onSubCategoryChange={onSubCategoryChange}
                    />

                    {/* Catalog Header */}
                    <div className="flex gap-4 items-center">
                        <Input
                            placeholder="Catalog title"
                            value={catalog.title}
                            disabled={disabled}
                            onChange={(e) =>
                                onTitleChange(catalogIdx, e.target.value)
                            }
                            className="rounded-xl"
                        />

                        {!disabled && (
                            <Button
                                variant="destructive"
                                onClick={() => onRemoveCatalog(catalogIdx)}
                            >
                                Remove
                            </Button>
                        )}
                    </div>

                    {/* Images */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {catalog.images.map((img) => (
                            <div
                                key={img.id}
                                className="relative rounded-lg overflow-hidden"
                            >
                                <Zoom>
                                    <img
                                        src={img.url}
                                        className="w-full h-full object-cover cursor-zoom-in"
                                        alt=""
                                    />
                                </Zoom>

                                {!disabled && (
                                    <button
                                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                                        onClick={() =>
                                            onRemoveImage(catalogIdx, img)
                                        }
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Images */}
                    {!disabled && (
                        <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary">
                            <Upload size={16} />
                            Add Images
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                hidden
                                onChange={(e) => {
                                    const files = Array.from(
                                        e.target.files || [],
                                    );
                                    onAddImages(catalogIdx, files);
                                    // Reset input to allow re-uploading the same file
                                    e.target.value = "";
                                }}
                            />
                        </label>
                    )}
                </div>
            ))}
        </div>
    );
}

function SubCategorySelect({
    catalog,
    catalogIdx,
    disabled,
    onSubCategoryChange,
}: {
    catalog: Catalog;
    catalogIdx: number;
    disabled: boolean;
    onSubCategoryChange: (index: number, subCategoryId: number) => void;
}) {
    const { data: subCategories = [] } = useVendorCatalogSubCategories(
        catalog.categoryId,
    );

    return (
        <Select
            value={catalog.subCategoryId?.toString()}
            disabled={disabled || !catalog.categoryId}
            onValueChange={(value) =>
                onSubCategoryChange(catalogIdx, Number(value))
            }
        >
            <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select Subcategory" />
            </SelectTrigger>
            <SelectContent>
                {subCategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
