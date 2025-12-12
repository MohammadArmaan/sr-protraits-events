"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VendorProfilePhotoUpload } from "@/components/vendor/profile/VendorProfilePhotoUpload";
import { VendorDetailsForm } from "@/components/vendor/profile/VendorDetailsForm";
import { VendorBusinessPhotos } from "@/components/vendor/profile/VendorBusinessPhotos";
import { submitProfileEdit } from "@/lib/vendor/editProfile";
import { toast } from "sonner";
import { useVendor } from "@/hooks/useVendor";
import axios from "axios";
import { LogOutIcon } from "lucide-react";

interface VendorProfileState {
    fullName: string;
    businessName: string;
    occupation: string;
    phone: string;
    address: string;
    email: string;
    businessDescription: string;
    profilePhoto: string;
    businessPhotos: string[];
}

export default function VendorProfilePage() {
    const { vendor } = useVendor();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // ✅ NEW loader state

    const initialProfile = useMemo<VendorProfileState>(() => {
        return {
            fullName: vendor?.fullName ?? "",
            businessName: vendor?.businessName ?? "",
            occupation: vendor?.occupation ?? "",
            phone: vendor?.phone ?? "",
            address: vendor?.address ?? "",
            email: vendor?.email ?? "",
            businessDescription: vendor?.businessDescription ?? "",
            profilePhoto: vendor?.profilePhoto ?? "",
            businessPhotos: vendor?.businessPhotos ?? [],
        };
    }, [vendor]);

    const [profile, setProfile] = useState<VendorProfileState>(initialProfile);

    if (vendor && profile.fullName === "" && initialProfile.fullName !== "") {
        setProfile(initialProfile);
    }

    const [newProfileFile, setNewProfileFile] = useState<File | null>(null);
    const [existingPhotos, setExistingPhotos] = useState<string[]>(vendor?.businessPhotos ?? []);
    const [newBusinessFiles, setNewBusinessFiles] = useState<File[]>([]);
    const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);

    useEffect(() => {
        if (vendor) setExistingPhotos(vendor.businessPhotos ?? []);
    }, [vendor]);

    const newPreviews = newBusinessFiles.map((f) => URL.createObjectURL(f));
    const merged = [
        ...existingPhotos.map((url, idx) => ({
            url,
            origin: "existing" as const,
            idx,
        })),
        ...newPreviews.map((url, idx) => ({
            url,
            origin: "new" as const,
            idx,
        })),
    ];

    // -------------------------------------------------
    // HANDLE SAVE
    // -------------------------------------------------
    async function handleSave() {
        try {
            setIsSaving(true); // ⏳ Start loader

            const form = new FormData();
            form.append("token", localStorage.getItem("vendorToken") ?? "");

            Object.entries(profile).forEach(([key, value]) => {
                if (key !== "profilePhoto" && key !== "businessPhotos") {
                    form.append(key, value);
                }
            });

            if (newProfileFile) {
                form.append("profilePhoto", newProfileFile);
            }

            newBusinessFiles.forEach((file) => {
                form.append("businessPhotos", file);
            });

            form.append("existingBusinessPhotos", JSON.stringify(existingPhotos));
            form.append("removedBusinessPhotos", JSON.stringify(removedPhotos));

            await submitProfileEdit(form);

            toast.success("Submitted for admin approval");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to submit changes");
        } finally {
            setIsSaving(false); // ⏹ Stop loader
        }
    }

    // -------------------------------------------------
    // LOGOUT HANDLER
    // -------------------------------------------------
    async function handleLogout() {
        await axios.post("/api/vendors/logout");
        localStorage.removeItem("vendorToken");
        toast.success("Logged out");
        window.location.href = "/auth/vendor-login";
    }

    return (
        <main className="max-w-4xl mx-auto pt-20 pb-10">
            <h1 className="text-4xl font-bold mb-4">Vendor Profile</h1>

            <Card className="rounded-2xl">
                <CardContent className="p-8 space-y-10">
                    <VendorProfilePhotoUpload
                        photo={profile.profilePhoto}
                        disabled={!isEditing || isSaving}
                        onChange={(file) => setNewProfileFile(file)}
                    />

                    <VendorDetailsForm
                        data={profile}
                        disabled={!isEditing || isSaving}
                        readOnlyEmail={true}
                        onChange={(field, value) =>
                            setProfile((prev) => ({
                                ...prev,
                                [field]: value,
                            }))
                        }
                    />

                    <VendorBusinessPhotos
                        items={merged}
                        disabled={!isEditing || isSaving}
                        onRemove={(item) => {
                            if (item.origin === "new") {
                                setNewBusinessFiles((prev) =>
                                    prev.filter((_, i) => i !== item.idx)
                                );
                            } else {
                                setRemovedPhotos((prev) => [...prev, item.url]);
                                setExistingPhotos((prev) => {
                                    const copy = [...prev];
                                    copy.splice(item.idx, 1);
                                    return copy;
                                });
                            }
                        }}
                        onAdd={(files) =>
                            setNewBusinessFiles((prev) => [...prev, ...files])
                        }
                    />

                    {!isEditing ? (
                        <Button
                            className="rounded-pill bg-gradient-primary"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-4">
                            <Button
                                className="rounded-pill bg-gradient-primary"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving Changes..." : "Save Changes"}
                            </Button>

                            <Button
                                variant="outline"
                                className="rounded-pill"
                                disabled={isSaving}
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}

                    {/* LOGOUT BUTTON */}
                    <div className="pt-6 border-t">
                        <h2 className="text-2xl font-semibold mb-5">Logout Account</h2>
                        <Button
                            variant="destructive"
                            className="rounded-pill w-full"
                            onClick={handleLogout}
                        >
                            Logout <LogOutIcon />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
