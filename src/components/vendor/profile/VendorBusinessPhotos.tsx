"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface Item {
    url: string;
    origin: "existing" | "new";
    idx: number;
}

interface Props {
    items: Item[];
    disabled: boolean;
    onAdd: (files: File[]) => void;
    onRemove: (item: Item) => void;
}

export function VendorBusinessPhotos({
    items,
    disabled,
    onAdd,
    onRemove,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    function openPicker() {
        if (!disabled) fileInputRef.current?.click();
    }

    function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
        if (disabled) return;
        const files = Array.from(e.target.files || []);
        if (files.length) onAdd(files);
    }

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-semibold">Business Photos</h2>
                <Button
                    variant="outline"
                    onClick={openPicker}
                    disabled={disabled}
                >
                    Add Photos
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAdd}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((it, i) => (
                    <div
                        key={`${it.origin}-${i}`}
                        className="relative rounded-lg overflow-hidden group"
                    >
                        <Zoom>
                            <img
                                src={it.url}
                                className="w-full h-full object-cover cursor-zoom-in rounded-lg"
                            />
                        </Zoom>
                        {!disabled && (
                            <button
                                className="absolute top-2 right-2 ..."
                                onClick={() => onRemove(it)}
                            >
                                <X size={16} />
                            </button>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/50 text-xs text-white px-2 py-1 rounded">
                            {it.origin === "new" ? "New" : "Existing"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
