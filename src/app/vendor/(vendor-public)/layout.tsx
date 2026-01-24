import type { Metadata } from "next";
import VendorAuthWrapper from "@/components/vendor/VendorAuthWrapper";
import { VendorNavbar } from "@/components/vendor/VendorNavbar";

export const metadata: Metadata = {
    title: {
        default: "Vendor Dashboard | SR Portraits & Events",
        template: "%s | Vendor | SR Portraits & Events",
    },
    description:
        "Vendor dashboard for managing profile, business information, bookings, and approvals.",
    openGraph: {
        title: "Vendor Dashboard",
        description:
            "Manage vendor profile, photos, and business content on SR Portraits & Events.",
        url: "https://sr-portraits.events/vendor",
        siteName: "SR Portraits & Events",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
            },
        ],
    },
};

export default function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Client-side auth check */}

                <VendorAuthWrapper>
                    <VendorNavbar />
                    {children}
                </VendorAuthWrapper>
        </>
    );
}
