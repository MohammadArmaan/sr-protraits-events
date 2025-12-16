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

    // booking states
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    if (isLoading || !product) return <Loader />;

    const images = product.images;
    const featuredIndex = product.featuredImageIndex ?? 0;
    const displayIndex = activeImage ?? featuredIndex;

    const isMultiDay =
        startDate && endDate && new Date(endDate) > new Date(startDate);

    const numberOfDays = isMultiDay
        ? Math.ceil(
              (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
          ) + 1
        : 1;

    const basePrice = isMultiDay
        ? Number(product.basePriceMultiDay) * numberOfDays
        : Number(product.basePriceSingleDay);

    const advanceAmount =
        product.advanceType === "PERCENTAGE"
            ? Math.round((basePrice * Number(product.advanceValue)) / 100)
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

                    <div className="grid grid-cols-4 gap-3">
                        {images.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`aspect-[4/3] rounded-xl overflow-hidden border ${
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
                        <Badge className="mb-3 bg-gradient-primary font-bold">
                            {product.occupation}
                        </Badge>

                        <h1 className="text-4xl font-bold">{product.title}</h1>

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
                                    {isMultiDay
                                        ? `Price (${numberOfDays} days)`
                                        : "Single Day Price"}
                                </span>
                                <span className="font-medium">
                                    ₹{basePrice.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Advance Required
                                </span>
                                <span className="text-2xl font-bold text-primary">
                                    ₹{advanceAmount.toLocaleString()}
                                </span>
                            </div>

                            {product.description && (
                                <p className="text-sm text-muted-foreground pt-3 border-t">
                                    {product.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* BOOKING */}
                    <Card className="rounded-2xl">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-xl font-semibold">
                                Request Booking
                            </h3>

                            <div>
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <Label>End Date (optional)</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    min={startDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>

                            {!isMultiDay && (
                                <>
                                    <div>
                                        <Label className="flex gap-2 items-center">
                                            <Clock className="h-4 w-4" />
                                            Start Time
                                        </Label>
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) =>
                                                setStartTime(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>End Time</Label>
                                        <Input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) =>
                                                setEndTime(e.target.value)
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            <Button
                                disabled={
                                    !startDate ||
                                    (!isMultiDay && (!startTime || !endTime))
                                }
                                className="w-full bg-gradient-primary rounded-pill"
                            >
                                Send Booking Request
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
