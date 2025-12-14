import { VendorFeaturedProducts } from "@/components/vendor/VendorFeaturedProducts";
import { VendorHeroSlider } from "@/components/vendor/VendorHeroSlider";

export default function Page() {
    return (
        <div>
            <VendorHeroSlider />
            <VendorFeaturedProducts />
        </div>
    );
}
