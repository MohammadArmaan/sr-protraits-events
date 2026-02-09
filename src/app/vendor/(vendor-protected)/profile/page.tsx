"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VendorProfilePhotoUpload } from "@/components/vendor/profile/VendorProfilePhotoUpload";
import { VendorDetailsForm } from "@/components/vendor/profile/VendorDetailsForm";
import VendorBusinessPhotos, {
    ImageItem,
} from "@/components/vendor/profile/VendorBusinessPhotos";
import { toast } from "sonner";
import { useVendor } from "@/hooks/queries/useVendor";
import VendorLogoutButton from "@/components/vendor/VendorLogoutButton";
import { useEditVendorProfile } from "@/hooks/queries/useEditVendorProfile";
import { ProfilePageSkeleton } from "@/components/skeleton/ProfilePageSkeleton";
import VendorBankDetails from "@/components/vendor/profile/VendorBankDetails";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface VendorProfileState {
    fullName: string;
    businessName: string;
    occupation: string;
    phone: string;
    address: string;
    email: string;
    businessDescription: string;

    yearsOfExperience: number;
    successfulEventsCompleted: number;
    gstNumber?: string | null;

    profilePhoto: string;
}

type EditableCatalog = {
    catalogId?: number; // Optional for new catalogs
    title: string;
    images: {
        id: string;
        url: string;
        origin: "existing" | "new";
    }[];
    newFiles: File[];
    removedUrls: string[];
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function VendorProfilePage() {
    const { data, isLoading } = useVendor();
    const { mutateAsync: editProfile } = useEditVendorProfile();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const vendor = data?.vendor ?? null;
    const catalogs = data?.catalogs ?? [];

    /* ---------------------------------------------------------------------- */
    /*                              PROFILE STATE                              */
    /* ---------------------------------------------------------------------- */

    const initialProfile = useMemo<VendorProfileState>(() => {
        if (!vendor) {
            return {
                fullName: "",
                businessName: "",
                occupation: "",
                phone: "",
                address: "",
                email: "",
                businessDescription: "",
                yearsOfExperience: 0,
                successfulEventsCompleted: 0,
                gstNumber: null,
                profilePhoto: "",
            };
        }

        return {
            fullName: vendor.fullName,
            businessName: vendor.businessName,
            occupation: vendor.occupation,
            phone: vendor.phone,
            address: vendor.address,
            email: vendor.email,
            businessDescription: vendor.businessDescription ?? "",
            yearsOfExperience: vendor.yearsOfExperience,
            successfulEventsCompleted: vendor.successfulEventsCompleted,
            gstNumber: vendor.gstNumber ?? null,
            profilePhoto: vendor.profilePhoto ?? "",
        };
    }, [vendor]);

    const [profile, setProfile] = useState<VendorProfileState>(initialProfile);

    useEffect(() => {
        if (vendor) setProfile(initialProfile);
    }, [vendor, initialProfile]);

    /* ---------------------------------------------------------------------- */
    /*                           PROFILE PHOTO STATE                           */
    /* ---------------------------------------------------------------------- */

    const [newProfileFile, setNewProfileFile] = useState<File | null>(null);

    /* ---------------------------------------------------------------------- */
    /*                            CATALOG EDIT STATE                           */
    /* ---------------------------------------------------------------------- */

    const [catalogEdits, setCatalogEdits] = useState<EditableCatalog[]>([]);

    useEffect(() => {
        if (!catalogs.length) return;

        setCatalogEdits(
            catalogs.map((c) => ({
                catalogId: c.id,
                title: c.title,
                images: c.images.map((img) => ({
                    id: crypto.randomUUID(), // ✅ stable unique ID
                    url: img.imageUrl,
                    origin: "existing" as const,
                })),
                newFiles: [],
                removedUrls: [],
            })),
        );
    }, [catalogs]);

    /* ---------------------------------------------------------------------- */
    /*                                SAVE LOGIC                               */
    /* ---------------------------------------------------------------------- */

    async function handleSave() {
        try {
            setIsSaving(true);

            const form = new FormData();

            /* ------------------------- PROFILE FIELDS ------------------------ */
            Object.entries(profile).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    form.append(key, String(value));
                }
            });

            if (newProfileFile) {
                form.append("profilePhoto", newProfileFile);
            }

            /* ------------------------ CATALOG CHANGES ------------------------- */
            form.append(
                "catalogChanges",
                JSON.stringify(
                    catalogEdits.map((c) => ({
                        catalogId: c.catalogId,
                        title: c.title,
                        removedImages: c.removedUrls,
                    })),
                ),
            );

            // ✅ FIX: Append files with proper indexing
            catalogEdits.forEach((catalog, catalogIndex) => {
                if (catalog.catalogId) {
                    // For existing catalogs, use catalogId
                    catalog.newFiles.forEach((file) => {
                        form.append(
                            `catalog_${catalog.catalogId}_images`,
                            file,
                        );
                    });
                } else {
                    // ✅ For NEW catalogs, use index-based key
                    catalog.newFiles.forEach((file) => {
                        form.append(`catalog_new_${catalogIndex}_images`, file);
                    });
                }
            });

            await editProfile(form);

            toast.success("Profile update sent for admin approval");
            setIsEditing(false);
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setIsSaving(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /*                                 LOADING                                 */
    /* ---------------------------------------------------------------------- */

    if (isLoading) {
        return <ProfilePageSkeleton />;
    }

    /* ---------------------------------------------------------------------- */
    /*                                  RENDER                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <main className="max-w-4xl mx-auto pt-20 pb-10">
            <h1 className="text-4xl font-bold mb-2">Vendor Profile</h1>
            <p className="text-base text-muted-foreground mb-10">
                Manage your business information
            </p>

            <Card className="rounded-2xl">
                <CardContent className="p-8 space-y-10">
                    {/* PROFILE PHOTO */}
                    <VendorProfilePhotoUpload
                        photo={profile.profilePhoto}
                        disabled={!isEditing || isSaving}
                        onChange={setNewProfileFile}
                    />

                    {/* PROFILE DETAILS */}
                    <VendorDetailsForm
                        data={profile}
                        disabled={!isEditing || isSaving}
                        readOnlyEmail
                        onChange={(field, value) =>
                            setProfile((prev) => ({
                                ...prev,
                                [field]: value,
                            }))
                        }
                    />

                    {/* CATALOGS */}

                    <VendorBusinessPhotos
                        catalogs={catalogEdits}
                        disabled={!isEditing || isSaving}
                        onAddCatalog={() => {
                            setCatalogEdits((prev) => [
                                ...prev,
                                {
                                    catalogId: undefined, // ✅ New catalog has no ID yet
                                    title: "",
                                    images: [],
                                    newFiles: [],
                                    removedUrls: [],
                                },
                            ]);
                        }}
                        onRemoveCatalog={(catalogIndex: number) => {
                            setCatalogEdits((prev) =>
                                prev.filter((_, i) => i !== catalogIndex),
                            );
                        }}
                        onTitleChange={(
                            catalogIndex: number,
                            title: string,
                        ) => {
                            setCatalogEdits((prev) => {
                                const copy = [...prev];
                                copy[catalogIndex].title = title;
                                return copy;
                            });
                        }}
                        onAddImages={(catalogIndex: number, files: File[]) => {
                            setCatalogEdits((prev) => {
                                return prev.map((catalog, idx) => {
                                    if (idx !== catalogIndex) return catalog;

                                    const newImages = files.map((file) => ({
                                        id: crypto.randomUUID(),
                                        url: URL.createObjectURL(file),
                                        origin: "new" as const,
                                    }));

                                    return {
                                        ...catalog,
                                        images: [
                                            ...catalog.images,
                                            ...newImages,
                                        ],
                                        newFiles: [
                                            ...catalog.newFiles,
                                            ...files,
                                        ], // ✅ Files are added
                                    };
                                });
                            });
                        }}
                        onRemoveImage={(
                            catalogIndex: number,
                            image: ImageItem,
                        ) => {
                            setCatalogEdits((prev) =>
                                prev.map((catalog, idx) => {
                                    if (idx !== catalogIndex) return catalog;

                                    // Find the index of this image among NEW images only
                                    const newImageIndex = catalog.images
                                        .filter((img) => img.origin === "new")
                                        .findIndex(
                                            (img) => img.id === image.id,
                                        );

                                    return {
                                        ...catalog,
                                        images: catalog.images.filter(
                                            (img) => img.id !== image.id,
                                        ),
                                        newFiles:
                                            image.origin === "new" &&
                                            newImageIndex !== -1
                                                ? catalog.newFiles.filter(
                                                      (_, i) =>
                                                          i !== newImageIndex,
                                                  )
                                                : catalog.newFiles,
                                        removedUrls:
                                            image.origin === "existing"
                                                ? [
                                                      ...catalog.removedUrls,
                                                      image.url,
                                                  ]
                                                : catalog.removedUrls,
                                    };
                                }),
                            );
                        }}
                    />

                    {/* ACTION BUTTONS */}
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
                                {isSaving
                                    ? "Saving Changes..."
                                    : "Save Changes"}
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
                </CardContent>
            </Card>

            {/* BANK DETAILS */}
            <VendorBankDetails />

            {/* LOGOUT */}
            <Card className="rounded-2xl mt-10">
                <CardContent>
                    <div className="pt-6 border-t">
                        <h2 className="text-2xl font-semibold mb-5">
                            Logout Account
                        </h2>
                        <VendorLogoutButton />
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
