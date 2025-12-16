import TestRazorpayButton from "@/components/payement/RazorpayButton";
import { VendorBrowseByCategory } from "@/components/vendor/VendorBrowseByCategory";
import { VendorFeaturedProducts } from "@/components/vendor/VendorFeaturedProducts";
import { VendorHeroSlider } from "@/components/vendor/VendorHeroSlider";

export default function Page() {
    return (
        <div>
            <VendorHeroSlider />
            <VendorFeaturedProducts />
            <VendorBrowseByCategory />
            <TestRazorpayButton />
        </div>
    );
}
