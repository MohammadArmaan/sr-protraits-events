"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload } from "lucide-react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import { useVendorCatalogCategories } from "@/hooks/queries/useVendorCatalogCategories";
import { useVendorCatalogSubCategories } from "@/hooks/queries/useVendorCatalogSubCategories";

type Props = {
    files: File[];
    previews: string[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setPreviews: React.Dispatch<React.SetStateAction<string[]>>;

    catalogTitle: string;
    setCatalogTitle: (value: string) => void;
    categoryId?: number;
    subCategoryId?: number;
    setCategoryId: (id: number) => void;
    setSubCategoryId: (id: number) => void;
};

export default function UploadPhotos({
    files,
    previews,
    setFiles,
    setPreviews,
    catalogTitle,
    setCatalogTitle,
    categoryId,
    setCategoryId,
    subCategoryId,
    setSubCategoryId,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { data: categories = [] } = useVendorCatalogCategories();
    const { data: subCategories = [] } =
        useVendorCatalogSubCategories(categoryId);

    function handleFiles(selected: File[]) {
        selected.forEach((file) => {
            setFiles((prev) => [...prev, file]);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    }

    return (
        <div className="space-y-6">
            {/* CATEGORY */}
            <div>
                <Label>
                    Category <span className="text-destructive">*</span>
                </Label>

                <Select
                    value={categoryId?.toString()}
                    onValueChange={(value) => {
                        setCategoryId(Number(value));
                        setSubCategoryId(undefined as any); // reset subcategory
                    }}
                >
                    <SelectTrigger className="rounded-xl bg-muted border-border w-full">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* SUBCATEGORY */}
            <div>
                <Label>
                    Subcategory <span className="text-destructive">*</span>
                </Label>

                <Select
                    value={subCategoryId?.toString()}
                    disabled={!categoryId}
                    onValueChange={(value) => setSubCategoryId(Number(value))}
                >
                    <SelectTrigger className="rounded-xl bg-muted border-border w-full">
                        <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                        {subCategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id.toString()}>
                                {sub.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* CATALOG TITLE */}
            <div>
                <Label htmlFor="catalogTitle">
                    Catalog Title <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="catalogTitle"
                    placeholder="e.g. Wedding Photography"
                    value={catalogTitle}
                    onChange={(e) => setCatalogTitle(e.target.value)}
                    className="rounded-xl bg-muted border-border"
                />
                <p className="text-sm text-muted-foreground mt-1">
                    This title will represent this service in your profile.
                </p>
            </div>

            {/* DRAG AREA */}
            <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
                    ${
                        isDragging
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted"
                    }
                `}
                onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const dropped = Array.from(e.dataTransfer.files || []);
                    handleFiles(dropped);
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium">Drag & Drop your photos</p>
                <p className="text-sm text-muted-foreground mb-4">
                    or click below to browse
                </p>

                <Button variant="outline" className="rounded-xl">
                    Select Photos
                </Button>
            </div>

            {/* HIDDEN INPUT */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    handleFiles(selected);
                }}
            />

            {/* PREVIEW GRID */}
            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {previews.map((src, idx) => (
                        <div
                            key={idx}
                            className="relative aspect-square rounded-xl overflow-hidden group"
                        >
                            <img
                                src={src}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 opacity-0 group-hover:opacity-100"
                                onClick={() => {
                                    setFiles((prev) =>
                                        prev.filter((_, i) => i !== idx),
                                    );
                                    setPreviews((prev) =>
                                        prev.filter((_, i) => i !== idx),
                                    );
                                }}
                            >
                                <X />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
