"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import Zoom from "react-medium-image-zoom";
import { getCroppedImg } from "@/lib/cropImage";

interface Props {
    photo: string | undefined;
    onChange: (file: File) => void;
    disabled: boolean;
}

export function VendorProfilePhotoUpload({ photo, onChange, disabled }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cropper states
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    function openFilePicker() {
        if (disabled) return;
        fileInputRef.current?.click();
    }

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (disabled) return;

        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
    }

    async function handleCropSave() {
        if (!imageSrc) return;

        const blob = await getCroppedImg(imageSrc, crop, zoom, 1);

        const file = new File([blob], "cropped-profile.jpg", {
            type: "image/jpeg",
        });

        onChange(file);
        toast.success("Profile photo updated (pending admin approval)");
        setCropModalOpen(false);
    }

    return (
        <div className="flex flex-col items-center mb-8">
            {/* Zoomable Preview */}
            <Zoom key={photo}>
                <img
                    src={photo || "/placeholder-user.jpeg"}
                    alt="Vendor Profile"
                    className="w-40 h-40 rounded-full object-cover cursor-zoom-in shadow-md mb-5"
                />
            </Zoom>

            {/* Upload Button */}
            <Button
                type="button"
                variant="outline"
                className="rounded-pill"
                disabled={disabled}
                onClick={openFilePicker}
            >
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
            </Button>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={disabled}
                onChange={handleFile}
            />

            {/* Crop Modal */}
            {cropModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[90%] max-w-md space-y-4">
                        <h2 className="text-xl font-semibold">
                            Crop Your Photo
                        </h2>

                        <div className="relative w-full h-64 bg-gray-200 rounded-md overflow-hidden">
                            <Cropper
                                image={imageSrc!}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setCropModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-gradient-primary"
                                onClick={handleCropSave}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
