"use client";

import { useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVendorProduct } from "@/hooks/queries/useVendorProduct";
import Loader from "@/components/Loader";

interface Props {
    uuid: string;
}

export function ProductClient({ uuid }: Props) {
    const { data: product, isLoading } = useVendorProduct(uuid);

    const [activeImage, setActiveImage] = useState<number | null>(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    if (isLoading || !product) {
        return <Loader />;
    }

    const images = product.businessPhotos;
    const featuredIndex = product.featuredImageIndex ?? 0;
    const displayIndex = activeImage ?? featuredIndex;

    const advanceAmount =
        product.advanceType === "PERCENTAGE"
            ? Math.round(
                  (Number(product.basePrice) *
                      Number(product.advanceValue)) /
                      100
              )
            : Number(product.advanceValue);

    return (
        <main className="pt-28 px-4 md:px-8 pb-16">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* IMAGE GALLERY */}
                <div className="space-y-4">
                    <Zoom>
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden cursor-zoom-in">
                            <img
                                src={images[displayIndex]}
                                alt={product.title}
                                className="w-full h-full object-cover rounded-2xl"
                            />
                        </div>
                    </Zoom>

                    {/* Thumbnails */}
                    <div className="grid grid-cols-4 gap-3">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`relative aspect-[4/3] rounded-xl overflow-hidden border transition-all ${
                                    idx === displayIndex
                                        ? "border-primary"
                                        : "border-border opacity-70 hover:opacity-100"
                                }`}
                            >
                                <img
                                    src={img}
                                    alt={`Gallery ${idx}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* DETAILS */}
                <div className="space-y-6">
                    <div>
                        <Badge className="mb-3 bg-gradient-primary border-gradient-primary font-bold">
                            {product.occupation}
                        </Badge>

                        <h1 className="text-4xl font-bold">
                            {product.title}
                        </h1>

                        <p className="text-muted-foreground mt-2">
                            {product.businessName}
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                            <Star className="h-5 w-5 fill-accent text-accent" />
                            <span className="font-medium">
                                {Number(product.rating).toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                ({product.ratingCount} reviews)
                            </span>
                        </div>
                    </div>

                    {/* PRICING */}
                    <Card className="rounded-2xl">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Base Price
                                </span>
                                <span className="font-medium">
                                    ₹
                                    {Number(
                                        product.basePrice
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between items-baseline">
                                <span className="text-muted-foreground">
                                    Advance Required
                                </span>
                                <span className="text-2xl font-bold text-primary">
                                    ₹{advanceAmount}
                                </span>
                            </div>

                            {/* ✅ Description added here */}
                            {product.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border">
                                    {product.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* BOOKING (NO PAYMENT YET) */}
                    <Card className="rounded-2xl">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-xl font-semibold">
                                Book This Vendor
                            </h3>

                            <div>
                                <Label className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Event Date
                                </Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) =>
                                        setDate(e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <Label className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Event Time
                                </Label>
                                <Input
                                    type="time"
                                    value={time}
                                    onChange={(e) =>
                                        setTime(e.target.value)
                                    }
                                />
                            </div>

                            <Button
                                disabled={!date || !time}
                                className="w-full bg-gradient-primary rounded-pill"
                            >
                                Book Now (Payment Coming Soon)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
