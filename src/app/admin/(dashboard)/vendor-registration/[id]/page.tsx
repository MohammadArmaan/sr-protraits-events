"use client";

import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Building2,
    Briefcase,
    CreditCard,
    IndianRupee,
    Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { useVendorDetails } from "@/hooks/queries/admin/useVendorDetails";
import { useApproveVendorRegistration } from "@/hooks/queries/admin/useApproveVendorRegistration";
import { useRejectVendorRegistration } from "@/hooks/queries/admin/useRejectVendorRegistration";
import Zoom from "react-medium-image-zoom";
import { VendorDetailsSkeleton } from "@/components/skeleton/VendorDetailsSkeleton";

export default function VendorDetailsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const vendorId = Number(params.id);

    const { data, isLoading, error } = useVendorDetails(vendorId);
    const approve = useApproveVendorRegistration();
    const reject = useRejectVendorRegistration();

    if (isLoading) {
        return <VendorDetailsSkeleton />;
    }

    if (error || !data?.vendor) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                Vendor not found
            </div>
        );
    }

    const vendor = data.vendor;

    const canApprove =
        vendor.status === "PENDING_APPROVAL" ||
        vendor.status === "CATALOG_CREATED";

    const handleAccept = () => {
        approve.mutate(
            { vendorId },
            {
                onSuccess: () => {
                    toast.success(`${vendor.fullName} approved`);
                    router.push("/admin/vendor-registration");
                },
            },
        );
    };

    const handleReject = () => {
        reject.mutate(
            { vendorId },
            {
                onSuccess: () => {
                    toast.error(`${vendor.fullName} rejected`);
                    router.push("/admin/vendor-registration");
                },
            },
        );
    };

    return (
        <div className="animate-fade-in">
            {/* Back */}
            <Button
                variant="ghost"
                onClick={() => router.push("/admin/vendor-registration")}
                className="mb-4 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Registrations
            </Button>

            {/* Header */}
            <PageHeader
                title="Vendor Registration Details"
                description="Review vendor information before approval"
            >
                {canApprove ? (
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleReject}
                            disabled={reject.isPending}
                            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                            Reject
                        </Button>
                        <Button
                            onClick={handleAccept}
                            disabled={approve.isPending}
                            className="gradient-primary text-primary-foreground hover:opacity-90"
                        >
                            Accept
                        </Button>
                    </div>
                ) : (
                    <Badge variant="default">Registered</Badge>
                )}
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* LEFT – PROFILE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-lg p-6 shadow-card">
                        <div className="flex items-start gap-6">
                            {vendor.profilePhoto && (
                                <Zoom>
                                    <img
                                        src={vendor.profilePhoto}
                                        alt={vendor.fullName}
                                        className="h-24 w-24 rounded-lg object-cover border-2 border-border"
                                    />
                                </Zoom>
                            )}

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-xl font-bold">
                                        {vendor.fullName}
                                    </h2>
                                    <Badge variant="secondary">
                                        {vendor.status.replace("_", " ")}
                                    </Badge>
                                </div>

                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {vendor.businessName}
                                </p>

                                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                    <Briefcase className="h-4 w-4" />
                                    {vendor.occupation}
                                </p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <InfoItem
                                icon={<Mail />}
                                label="Email"
                                value={vendor.email}
                            />
                            <InfoItem
                                icon={<Phone />}
                                label="Phone"
                                value={vendor.phone}
                            />
                            <InfoItem
                                icon={<MapPin />}
                                label="Address"
                                value={vendor.address}
                                full
                            />
                            <InfoItem
                                icon={<Briefcase className="h-4 w-4" />}
                                label="Experience"
                                value={`${vendor.yearsOfExperience} years`}
                            />

                            <InfoItem
                                icon={<Building2 className="h-4 w-4" />}
                                label="Successful Events"
                                value={String(vendor.successfulEventsCompleted)}
                            />

                            {vendor.gstNumber && (
                                <InfoItem
                                    icon={<CreditCard className="h-4 w-4" />}
                                    label="GST Number"
                                    value={vendor.gstNumber}
                                    full
                                />
                            )}

                            <InfoItem
                                icon={<IndianRupee className="h-4 w-4" />}
                                label="Demand Price"
                                value={String(vendor.demandPrice)}
                            />

                            <InfoItem
                                icon={<Star className="h-4 w-4" />}
                                label="Vendor Points"
                                value={String(vendor.points)}
                            />

                        </div>

                        <Separator className="my-6" />

                        <div>
                            <h3 className="font-semibold mb-3">
                                Business Description
                            </h3>
                            <p className="text-muted-foreground">
                                {vendor.businessDescription ?? "—"}
                            </p>
                        </div>
                    </div>

                    {/* Business Photos */}
                    {vendor.businessPhotos?.length > 0 && (
                        <div className="bg-card rounded-lg p-6 shadow-card">
                            <h3 className="font-semibold mb-4">
                                Business Photos
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {vendor.businessPhotos.map((photo, i) => (
                                    <Zoom key={i}>
                                        <img
                                            src={photo}
                                            className="h-48 w-full object-cover rounded-lg border"
                                        />
                                    </Zoom>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Catalogs - moved here to left column */}
                    {vendor.catalogs?.length > 0 && (
                        <div className="bg-card rounded-lg p-6 shadow-card">
                            <h3 className="font-semibold mb-4">Catalogs</h3>

                            <div className="space-y-6">
                                {vendor.catalogs.map((catalog) => (
                                    <div
                                        key={catalog.id}
                                        className="border rounded-lg p-4"
                                    >
                                        <h4 className="font-semibold mb-2">
                                            {catalog.title}
                                        </h4>

                                        {catalog.description && (
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {catalog.description}
                                            </p>
                                        )}

                                        {catalog.images.length > 0 ? (
                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {catalog.images.map((img) => (
                                                    <Zoom key={img.id}>
                                                        <img
                                                            src={img.imageUrl}
                                                            className="h-40 w-full object-cover rounded-lg border"
                                                            alt=""
                                                        />
                                                    </Zoom>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No images in this catalog
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT – BANK DETAILS */}
                <div className="space-y-6">
                    <div className="bg-card rounded-lg p-6 shadow-card">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="h-5 w-5" />
                            <h3 className="font-semibold">Bank Details</h3>
                        </div>

                        {vendor.bankDetails ? (
                            <div className="space-y-4">
                                <BankItem
                                    label="Account Holder"
                                    value={vendor.bankDetails.accountHolderName}
                                />
                                <BankItem
                                    label="Account Number"
                                    value={vendor.bankDetails.accountNumber}
                                />
                                <BankItem
                                    label="IFSC Code"
                                    value={vendor.bankDetails.ifscCode}
                                />
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-muted-foreground">
                                        Payout Ready
                                    </span>
                                    <Badge
                                        variant={
                                            vendor.bankDetails.isPayoutReady
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {vendor.bankDetails.isPayoutReady
                                            ? "Yes"
                                            : "No"}
                                    </Badge>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                Bank details not submitted
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- Small Helpers ---------- */

function InfoItem({
    icon,
    label,
    value,
    full = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    full?: boolean;
}) {
    return (
        <div
            className={`flex items-start gap-3 p-3 rounded-lg bg-muted/50 ${
                full ? "sm:col-span-2" : ""
            }`}
        >
            {icon}
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}

function BankItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}