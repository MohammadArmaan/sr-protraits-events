"use client";

import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Check,
    X,
    ImageIcon,
    FileText,
    User,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
} from "lucide-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useProfileEditList } from "@/hooks/queries/admin/useProfileEditList";
import { useApproveProfileEdit } from "@/hooks/queries/admin/useApproveProfileEdit";
import { useRejectProfileEdit } from "@/hooks/queries/admin/useRejectProfileEdit";
import { ProfileEditDetailsSkeleton } from "@/components/skeleton/ProfileEditDetailsSkeleton";
import EditImageCard from "../_components/EditImageCard";
import { PROFILE_EDIT_FIELD_MAP } from "@/lib/admin/profileEditFieldMap";
import type { ProfileTextEditableField } from "@/types/admin/profile-edit";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function renderValue(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
}

function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function isProfileTextField(
    field: string,
): field is ProfileTextEditableField {
    return field in PROFILE_EDIT_FIELD_MAP;
}

/* -------------------------------------------------------------------------- */
/*                                   STATUS UI                                */
/* -------------------------------------------------------------------------- */

type StatusConfig = {
    icon: typeof Clock;
    label: string;
    className: string;
};

const STATUS_MAP: Record<string, StatusConfig> = {
    PENDING: {
        icon: Clock,
        label: "Pending Review",
        className:
            "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
    },
    APPROVED: {
        icon: CheckCircle2,
        label: "Approved",
        className:
            "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    },
    REJECTED: {
        icon: XCircle,
        label: "Rejected",
        className:
            "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
    },
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function ProfileEditDetailsPage() {
    const router = useRouter();
    const params = useParams<{ editId: string }>();
    const editId = Number(params.editId);

    const { data, isLoading } = useProfileEditList();
    const approve = useApproveProfileEdit();
    const reject = useRejectProfileEdit();

    const edit = data?.edits.find((e) => e.editId === editId);

    const catalogChanges = edit?.catalogChanges ?? [];


    /* ---------------- Loading ---------------- */
    if (isLoading) {
        return <ProfileEditDetailsSkeleton />;
    }

    /* ---------------- Not Found ---------------- */
    if (!edit) {
        return (
            <Card className="max-w-xl mx-auto mt-20">
                <CardContent className="py-10 text-center space-y-4">
                    <XCircle className="mx-auto h-10 w-10 text-destructive" />
                    <p className="text-muted-foreground">
                        Profile edit request not found
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/admin/profile-edits")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </CardContent>
            </Card>
        );
    }

    /* ---------------------------------------------------------------------- */
    /*                              DERIVED STATE                              */
    /* ---------------------------------------------------------------------- */

    const isPending = edit.status === "PENDING";

    const profileChanges = edit.profileChanges ?? {};
    const hasTextChanges = Object.keys(profileChanges).length > 0;

    // ✅ FIXED: only true when vendor uploaded a new photo
    const hasProfilePhotoChange = Boolean(edit.newProfilePhotoUrl);

    const statusConfig = STATUS_MAP[edit.status] ?? STATUS_MAP.PENDING;
    const StatusIcon = statusConfig.icon;

    const currentProfile = {
        fullName: edit.vendorName ?? "",
        businessName: edit.vendorBusinessName ?? "",
        occupation: edit.vendorOccupation ?? "",
        phone: edit.vendorPhone ?? "",
        address: edit.vendorAddress ?? "",
        businessDescription: edit.vendorDescription ?? "",
        profilePhoto: edit.vendorCurrentPhoto ?? undefined,
        gstNumber: edit.vendorGstNumber ?? "",
        yearsOfExperience: edit.vendorYearsOfExperience ?? undefined,
        successfulEventsCompleted: edit.vendorSuccessfulEventsCompleted ?? undefined
    };

    /* ---------------------------------------------------------------------- */
    /*                                  ACTIONS                                */
    /* ---------------------------------------------------------------------- */

    const handleApprove = () => {
        approve.mutate(
            { editId: edit.editId },
            {
                onSuccess: () => {
                    toast.success("Profile edit approved");
                    router.push("/admin/profile-edits");
                },
            },
        );
    };

    const handleReject = () => {
        reject.mutate(
            { editId: edit.editId },
            {
                onSuccess: () => {
                    toast.error("Profile edit rejected");
                    router.push("/admin/profile-edits");
                },
            },
        );
    };

    /* ---------------------------------------------------------------------- */
    /*                                  RENDER                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* ---------------- Header ---------------- */}
            <PageHeader
                title="Profile Edit Request"
                description="Review vendor profile update request"
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${statusConfig.className}`}
                    >
                        <StatusIcon className="h-4 w-4" />
                        {statusConfig.label}
                    </div>

                    {isPending && (
                        <>
                            <Button
                                onClick={handleApprove}
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={approve.isPending}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={reject.isPending}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </>
                    )}
                </div>
            </PageHeader>

            {/* ---------------- Metadata ---------------- */}
            <Card>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
                    <Info label="Edit ID" value={`#${edit.editId}`} />
                    <Info label="Vendor" value={edit.vendorName} />
                    <Info label="Email" value={edit.vendorEmail} />
                    <Info label="Requested At" value={formatDate(edit.createdAt)} />
                </CardContent>
            </Card>

            {/* ---------------- Text Changes ---------------- */}
            {hasTextChanges && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Profile Field Changes
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Original */}
                        <div>
                            <h3 className="font-semibold mb-3">
                                Original Values
                            </h3>

                            {Object.keys(profileChanges).map((field) => {
                                if (!isProfileTextField(field)) return null;

                                const oldValue =
                                    PROFILE_EDIT_FIELD_MAP[field](
                                        currentProfile,
                                    );

                                return (
                                    <div key={field} className="mb-4">
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {field}
                                        </p>
                                        <p className="font-medium">
                                            {renderValue(oldValue)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Requested */}
                        <div>
                            <h3 className="font-semibold mb-3">
                                Requested Changes
                            </h3>

                            {Object.entries(profileChanges).map(
                                ([field, value]) => {
                                    if (!isProfileTextField(field)) return null;

                                    return (
                                        <div key={field} className="mb-4">
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {field}
                                            </p>
                                            <p className="font-medium">
                                                {renderValue(value)}
                                            </p>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ---------------- Profile Photo ---------------- */}
            {hasProfilePhotoChange && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Profile Photo Change
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EditImageCard
                            title="Current Photo"
                            src={edit.oldProfilePhotoUrl}
                            isOriginal
                        />
                        <EditImageCard
                            title="New Photo"
                            src={edit.newProfilePhotoUrl}
                            highlight
                        />
                    </CardContent>
                </Card>
            )}

            {/* ---------------- Catalog Snapshot ---------------- */}
{catalogChanges.length > 0 && (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Catalog Changes
            </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
            {catalogChanges.map((change, index) => {
                // Find the corresponding catalog from edit.catalogs
                const catalog = edit.catalogs?.find(
                    (cat) => cat.id === change.catalogId
                );

                const hasAddedImages = (change.payload.addedImages?.length ?? 0) > 0;
                const hasRemovedImages = (change.payload.removedImageIds?.length ?? 0) > 0;

                return (
                    <div
                        key={change.catalogId ?? `new-${index}`}
                        className="border rounded-lg p-6 space-y-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg">
                                        {change.payload.title || catalog?.title || "Untitled Catalog"}
                                    </h3>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                            change.action === "ADD"
                                                ? "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200"
                                                : change.action === "UPDATE"
                                                ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                                                : "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200"
                                        }`}
                                    >
                                        {change.action}
                                    </span>
                                </div>
                                {change.catalogId && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Catalog ID: {change.catalogId}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Title Change */}
                        {change.payload.title && catalog?.title !== change.payload.title && (
                            <div className="bg-muted/50 p-3 rounded-md">
                                <p className="text-sm font-medium mb-1">Title Change:</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">
                                        {catalog?.title || "—"}
                                    </span>
                                    <span>→</span>
                                    <span className="font-medium">
                                        {change.payload.title}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Added Images */}
                        {hasAddedImages && (
                            <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <Check className="h-4 w-4" />
                                    Added Images ({change.payload.addedImages!.length})
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {change.payload.addedImages!.map((imageUrl, imgIndex) => (
                                        <div
                                            key={imgIndex}
                                            className="relative aspect-square rounded-lg overflow-hidden border-2 border-emerald-500"
                                        >
                                            <Zoom>
                                                <img
                                                    src={imageUrl}
                                                    alt={`Added image ${imgIndex + 1}`}
                                                    className="w-full h-full object-cover cursor-zoom-in"
                                                />
                                            </Zoom>
                                            <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Removed Images */}
                        {hasRemovedImages && catalog && (
                            <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2 text-rose-700 dark:text-rose-400">
                                    <X className="h-4 w-4" />
                                    Removed Images ({change.payload.removedImageIds!.length})
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {change.payload.removedImageIds!.map((removedId) => {
                                        // Find the image in the catalog
                                        const removedImage = catalog.images?.find(
                                            (img) => img.id === removedId
                                        );

                                        if (!removedImage) return null;

                                        return (
                                            <div
                                                key={removedId}
                                                className="relative aspect-square rounded-lg overflow-hidden border-2 border-rose-500 opacity-75"
                                            >
                                                <Zoom>
                                                    <img
                                                        src={removedImage.imageUrl}
                                                        alt={`Removed image ${removedId}`}
                                                        className="w-full h-full object-cover cursor-zoom-in grayscale"
                                                    />
                                                </Zoom>
                                                <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1">
                                                    <X className="h-3 w-3" />
                                                </div>
                                                <div className="absolute inset-0 bg-black/20" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* No Changes */}
                        {!hasAddedImages && !hasRemovedImages && !change.payload.title && (
                            <p className="text-sm text-muted-foreground italic">
                                No visual changes detected
                            </p>
                        )}
                    </div>
                );
            })}
        </CardContent>
    </Card>
)}

        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                               SMALL COMPONENT                              */
/* -------------------------------------------------------------------------- */

function Info({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    );
}
