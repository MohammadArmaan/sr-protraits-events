"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useBanners } from "@/hooks/queries/useBanners";
import { BannerSkeleton } from "../skeleton/BannerSkeleton";

export const VendorHeroSlider = () => {
    const router = useRouter();
    const { data: banners = [], isLoading } = useBanners();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);

    /* ----------------------------
       AUTOPLAY
    ----------------------------- */
    useEffect(() => {
        if (!isHovering && banners.length > 1) {
            autoplayRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % banners.length);
            }, 5000);
        }

        return () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };
    }, [isHovering, banners.length]);

    /* ----------------------------
       LOADING STATE
    ----------------------------- */
    if (isLoading) {
        return (
            <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, i) => (
                    <BannerSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (banners.length === 0) {
        return null;
    }

    const nextSlide = () =>
        setCurrentSlide((prev) => (prev + 1) % banners.length);

    const prevSlide = () =>
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

    return (
        <div
            className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden bg-black"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* SLIDES */}
            {banners.map((slide, index) => {
                const active = index === currentSlide;

                return (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                            active ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                    >
                        {/* IMAGE */}
                        <img
                            src={slide.imageUrl}
                            alt={slide.title ?? "Banner"}
                            className="w-full h-full object-cover"
                        />

                        {/* OVERLAY */}
                        <div className="absolute inset-0 bg-black/50" />

                        {/* TEXT */}
                        <div className="absolute inset-0 flex items-center justify-center text-center px-6 z-20">
                            <div className="max-w-3xl">
                                {slide.title && (
                                    <h2
                                        className={`text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 transition-all duration-700 ${
                                            active
                                                ? "opacity-100 translate-y-0"
                                                : "opacity-0 translate-y-8"
                                        }`}
                                    >
                                        {slide.title}
                                    </h2>
                                )}

                                {slide.subtitle && (
                                    <p
                                        className={`text-base sm:text-xl text-white/90 transition-all duration-700 delay-100 ${
                                            active
                                                ? "opacity-100 translate-y-0"
                                                : "opacity-0 translate-y-8"
                                        }`}
                                    >
                                        {slide.subtitle}
                                    </p>
                                )}

                                <div
                                    className={`mt-6 transition-all duration-700 delay-200 ${
                                        active ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    <Button
                                        className="rounded-full bg-gradient-primary px-8 py-6 text-lg shadow-lg"
                                        onClick={() =>
                                            router.push(
                                                slide.ctaLink ?? "/vendor/shop"
                                            )
                                        }
                                    >
                                        {slide.ctaText ?? "Explore Vendors"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* LEFT BUTTON */}
            <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="absolute z-30 left-4 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-md shadow-lg"
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* RIGHT BUTTON */}
            <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="absolute z-30 right-4 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-md shadow-lg"
            >
                <ChevronRight className="h-6 w-6" />
            </Button>

            {/* DOTS */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide
                                ? "w-8 bg-gradient-primary shadow-md"
                                : "w-2 bg-white/40"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};
