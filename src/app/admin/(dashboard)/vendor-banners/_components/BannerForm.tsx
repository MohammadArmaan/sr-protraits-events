"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { VendorBanner } from "@/types/admin/vendor-banner";

interface Props {
    banner: VendorBanner | null;
    onSubmit: (formData: FormData) => void;
    onCancel: () => void;
}

export function BannerForm({ banner, onSubmit, onCancel }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        subtitle: "",
        ctaText: "",
        ctaLink: "",
        isActive: true,
    });

    useEffect(() => {
        if (!banner) return;

        setForm({
            title: banner.title,
            subtitle: banner.subtitle,
            ctaText: banner.ctaText,
            ctaLink: banner.ctaLink,
            isActive: banner.isActive,
        });

        setPreview(banner.imageUrl);
    }, [banner?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const fd = new FormData();
        if (file) fd.append("image", file);
        fd.append("title", form.title);
        fd.append("subtitle", form.subtitle);
        fd.append("ctaText", form.ctaText);
        fd.append("ctaLink", form.ctaLink);
        fd.append("isActive", String(form.isActive));

        onSubmit(fd);
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            {/* Image Upload */}
            <div>
                <Label>Banner Image</Label>
                <div
                    onClick={() => fileRef.current?.click()}
                    className="mt-1.5 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-smooth"
                >
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setFile(f);
                            setPreview(URL.createObjectURL(f));
                        }}
                    />

                    {preview ? (
                        <div className="relative">
                            <img
                                src={preview}
                                className="w-full h-40 object-cover rounded-lg"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    setPreview(null);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="py-10 flex flex-col items-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6 mb-2" />
                            <p className="text-sm font-medium">
                                Click or drag image to upload
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Title */}
            <div>
                <Label>Banner Title</Label>
                <Input
                    value={form.title}
                    onChange={(e) =>
                        setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="mt-1.5"
                    required
                />
            </div>

            {/* Subtitle */}
            <div>
                <Label>Subtitle</Label>
                <Textarea
                    rows={2}
                    value={form.subtitle}
                    onChange={(e) =>
                        setForm((p) => ({ ...p, subtitle: e.target.value }))
                    }
                    className="mt-1.5"
                    required
                />
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Button Text</Label>
                    <Input
                        value={form.ctaText}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, ctaText: e.target.value }))
                        }
                        required
                    />
                </div>
                <div>
                    <Label>Button Link</Label>
                    <Input
                        value={form.ctaLink}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, ctaLink: e.target.value }))
                        }
                        required
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <Button
                    variant="outline"
                    type="button"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-primary text-primary-foreground"
                >
                    {banner ? "Update Banner" : "Create Banner"}
                </Button>
            </div>
        </form>
    );
}
