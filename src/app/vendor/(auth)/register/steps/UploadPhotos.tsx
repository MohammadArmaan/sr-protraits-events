"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";

type Props = {
    files: File[];
    previews: string[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setPreviews: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function UploadPhotos({
    files,
    previews,
    setFiles,
    setPreviews,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

function handleFiles(selected: File[]) {
    selected.forEach((file) => {
        // Save file
        setFiles(prev => [...prev, file]);

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
    });
}

    return (
        <div className="space-y-4">
            {/* DRAG AREA */}
            <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
                    ${isDragging ? "border-primary bg-primary/10" : "border-border bg-muted"}
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
                            <img src={src} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 opacity-0 group-hover:opacity-100"
                                onClick={() => {
                                    const newFiles = files.filter((_, i) => i !== idx);
                                    const newPrev = previews.filter((_, i) => i !== idx);
                                    setFiles(newFiles);
                                    setPreviews(newPrev);
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
