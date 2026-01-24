import type { Metadata } from "next";
import ShopClient from "./ShopClient";


export const metadata: Metadata = {
    title: "Browse Event Vendors | Vendor Portal",
    description:
        "Find and compare verified event vendors including photographers, caterers, decorators and more.",
};

export default function VendorShopPage() {
    return (
            <ShopClient />
    );
}
