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
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Zoom from "react-medium-image-zoom";
import { useProfileEditList } from "@/hooks/queries/admin/useProfileEditList";
import { useApproveProfileEdit } from "@/hooks/queries/admin/useApproveProfileEdit";
import { useRejectProfileEdit } from "@/hooks/queries/admin/useRejectProfileEdit";
import EditImageCard from "../_components/EditImageCard";
import {
    ProfileTextEditableField,
    VendorProfileEditChanges,
} from "@/types/admin/profile-edit";
import { PROFILE_EDIT_FIELD_MAP } from "@/lib/admin/profileEditFieldMap";
import { ProfileEditDetailsSkeleton } from "@/components/skeleton/ProfileEditDetailsSkeleton";

type StatusConfig = {
    icon: typeof Clock;
    className: string;
    label: string;
};

type StatusConfigMap = {
    PENDING: StatusConfig;
    APPROVED: StatusConfig;
    REJECTED: StatusConfig;
    [key: string]: StatusConfig;
};

export default function ProfileEditDetailsPage() {
    const router = useRouter();
    const params = useParams<{ editId: string }>();

    const editId = Number(params.editId);

    const { data, isLoading } = useProfileEditList();
    const approve = useApproveProfileEdit();
    const reject = useRejectProfileEdit();

    const edit = data?.edits.find((e) => e.editId === editId);

    const currentProfile = {
        fullName: edit?.vendorName,
        businessName: edit?.vendorBusinessName,
        occupation: "", // fill when backend adds it
        phone: "",
        address: "",
        businessDescription: undefined,
        profilePhoto: edit?.vendorCurrentPhoto ?? undefined,
        businessPhotos: edit?.vendorBusinessPhotos ?? [],
    };

    /* ---------------- Loading ---------------- */
    if (isLoading) {
        return <ProfileEditDetailsSkeleton />;
    }

    function isProfileTextField(
        field: string,
    ): field is ProfileTextEditableField {
        return field in PROFILE_EDIT_FIELD_MAP;
    }

    /* ---------------- Not Found ---------------- */
    if (!edit) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                            <XCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">
                                Request Not Found
                            </h3>
                            <p className="text-muted-foreground">
                                The requested profile edit could not be found.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/admin/profile-edits")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Requests
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isPending = edit.status === "PENDING";
    const hasTextChanges = Object.keys(edit.changes).length > 0;
    const hasProfilePhotoChange =
        edit.oldProfilePhotoUrl !== edit.newProfilePhotoUrl;
    const hasBusinessPhotos = edit.vendorBusinessPhotos?.length > 0;

    const formatDate = (d: string) =>
        new Date(d).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    /* ---------------- Actions ---------------- */
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

    const getStatusBadge = () => {
        const statusConfig: StatusConfigMap = {
            PENDING: {
                icon: Clock,
                className:
                    "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
                label: "Pending Review",
            },
            APPROVED: {
                icon: CheckCircle2,
                className:
                    "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
                label: "Approved",
            },
            REJECTED: {
                icon: XCircle,
                className:
                    "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
                label: "Rejected",
            },
        };

        const config = statusConfig[edit.status] || statusConfig.PENDING;
        const Icon = config.icon;

        return (
            <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.className}`}
            >
                <Icon className="h-4 w-4" />
                {config.label}
            </div>
        );
    };

    /* ---------------- Render ---------------- */
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-6 rounded-xl border border-primary/10">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/admin/profile-edits")}
                        className="shrink-0 hover:bg-primary/10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            Profile Edit Request
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-md">
                                <User className="h-3.5 w-3.5" />
                                <span className="font-medium text-foreground">
                                    {edit.vendorName}
                                </span>
                            </div>
                            <span className="text-muted-foreground/50">•</span>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(edit.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {getStatusBadge()}

                    {isPending && (
                        <div className="flex gap-2">
                            <Button
                                onClick={handleApprove}
                                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all"
                                disabled={approve.isPending}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                onClick={handleReject}
                                variant="destructive"
                                className="shadow-sm hover:shadow-md transition-all"
                                disabled={reject.isPending}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* -------- Text Changes -------- */}
            {hasTextChanges && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">Field Changes</h2>
                        <div className="ml-auto bg-muted px-3 py-1 rounded-full text-xs font-medium">
                            {Object.keys(edit.changes).length} Field
                            {Object.keys(edit.changes).length !== 1 ? "s" : ""}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* ---------------- Original Values ---------------- */}
                        <Card className="border-2 border-muted/50 hover:border-muted transition-all hover:shadow-md">
                            <CardHeader className="pb-4 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-muted-foreground/60 ring-4 ring-muted-foreground/10" />
                                    <CardTitle className="text-base">
                                        Original Values
                                    </CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-6">
                                {Object.keys(edit.changes).map((field) => {
                                    if (!isProfileTextField(field)) return null;

                                    const oldValue =
                                        PROFILE_EDIT_FIELD_MAP[field](
                                            currentProfile,
                                        );

                                    return (
                                        <div
                                            key={field}
                                            className="space-y-2 group"
                                        >
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                                {field
                                                    .replace(/([A-Z])/g, " $1")
                                                    .trim()}
                                            </p>

                                            <div className="bg-muted/50 p-3 rounded-lg border border-muted group-hover:bg-muted/70 transition-colors">
                                                <p className="text-sm font-medium text-foreground break-words">
                                                    {oldValue ? (
                                                        String(oldValue)
                                                    ) : (
                                                        <span className="text-muted-foreground italic flex items-center gap-1.5">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            Empty
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* ---------------- Requested Changes ---------------- */}
                        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent hover:border-primary/50 transition-all hover:shadow-lg">
                            <CardHeader className="pb-4 bg-primary/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse" />
                                    <CardTitle className="text-base">
                                        Requested Changes
                                    </CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-6">
                                {Object.entries(edit.changes).map(
                                    ([field, newValue]) => {
                                        if (!isProfileTextField(field))
                                            return null;

                                        return (
                                            <div
                                                key={field}
                                                className="space-y-2 group"
                                            >
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-primary" />
                                                    {field
                                                        .replace(
                                                            /([A-Z])/g,
                                                            " $1",
                                                        )
                                                        .trim()}
                                                </p>

                                                <div className="bg-white/80 dark:bg-background/80 p-3 rounded-lg border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                                                    <p className="text-sm font-medium text-foreground break-words">
                                                        {newValue ? (
                                                            String(newValue)
                                                        ) : (
                                                            <span className="text-muted-foreground italic flex items-center gap-1.5">
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                                Empty
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* -------- Profile Photo Change -------- */}
            {hasProfilePhotoChange && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ImageIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">
                            Profile Photo Change
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EditImageCard
                            title="Current Profile Photo"
                            src={edit.oldProfilePhotoUrl}
                            isOriginal
                        />
                        <EditImageCard
                            title="Requested Profile Photo"
                            src={edit.newProfilePhotoUrl}
                            highlight
                        />
                    </div>

                    {/* Side by Side Comparison */}
                    <Card className="overflow-hidden border-2 hover:shadow-xl transition-all">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-primary" />
                                Side-by-Side Comparison
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-2">
                                <div className="relative group">
                                    <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                                        Current
                                    </div>
                                    {edit.oldProfilePhotoUrl ? (
                                        <Zoom>
                                            <img
                                                src={edit.oldProfilePhotoUrl}
                                                alt="Current profile photo"
                                                className="w-full aspect-square object-cover border-r-2 border-border"
                                            />
                                        </Zoom>
                                    ) : (
                                        <div className="w-full aspect-square bg-muted/50 border-r-2 border-border flex items-center justify-center">
                                            <div className="text-center space-y-2">
                                                <User className="h-12 w-12 mx-auto text-muted-foreground/40" />
                                                <p className="text-sm text-muted-foreground font-medium">
                                                    No Previous Photo
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute top-3 left-3 z-10 bg-primary backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                                        New
                                    </div>
                                    <Zoom>
                                        <img
                                            src={
                                                edit.newProfilePhotoUrl ||
                                                "/placeholder-user.jpeg"
                                            }
                                            alt="New profile photo"
                                            className="w-full aspect-square object-cover"
                                        />
                                    </Zoom>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* -------- Business Photos -------- */}
            {hasBusinessPhotos && (
                <Card className="border-2 hover:shadow-lg transition-all">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <ImageIcon className="h-4 w-4 text-primary" />
                            </div>
                            Business Photos
                            <span className="ml-auto bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium text-nowrap">
                                {edit.vendorBusinessPhotos.length}{" "}
                                {edit.vendorBusinessPhotos.length === 1
                                    ? "Photo"
                                    : "Photos"}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {edit.vendorBusinessPhotos.map((img, i) => (
                                <div
                                    key={i}
                                    className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-primary/50 transition-all hover:shadow-lg"
                                >
                                    <Zoom>
                                        <img
                                            src={
                                                img || "/placeholder-user.jpeg"
                                            }
                                            alt={`Business photo ${i + 1}`}
                                            className="w-full aspect-square object-cover"
                                        />
                                    </Zoom>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Vendor Info Summary */}
            <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-2">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        Request Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Edit ID
                            </p>
                            <p className="font-mono font-bold text-lg">
                                #{edit.editId}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Vendor Name
                            </p>
                            <p className="font-semibold text-lg">
                                {edit.vendorName}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Requested At
                            </p>
                            <p className="font-semibold">
                                {formatDate(edit.createdAt)}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Changes
                            </p>
                            <p className="font-semibold">
                                {[
                                    hasTextChanges &&
                                        `${Object.keys(edit.changes).length} field${Object.keys(edit.changes).length !== 1 ? "s" : ""}`,
                                    hasProfilePhotoChange && "Profile photo",
                                    hasBusinessPhotos &&
                                        `${edit.vendorBusinessPhotos.length} business photo${edit.vendorBusinessPhotos.length !== 1 ? "s" : ""}`,
                                ]
                                    .filter(Boolean)
                                    .join(", ") || "None"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
