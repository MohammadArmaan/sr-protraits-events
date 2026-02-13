"use client";

import { useMemo, useState } from "react";
import {
    differenceInCalendarDays,
    isBefore,
    isSameDay,
    startOfDay,
    format,
} from "date-fns";
import { AlertTriangle, Clock, Tag } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-picker";

import { useCreateVendorBooking } from "@/hooks/queries/useCreateVendorBooking";
import { useValidateVendorCoupon } from "@/hooks/queries/useValidateVendorCoupon";
import { useActiveBookingStatus } from "@/hooks/queries/useActiveBookingStatus";
import { useBookingAvailability } from "@/hooks/queries/useBookingAvailability";
import { ValidateCouponResponse } from "@/types/vendor-booking";
import { Textarea } from "@/components/ui/textarea";

/* ---------------------------------- */
interface VendorBookingFormProps {
    vendorId: number;
    vendorProductId: number;
    basePriceSingleDay: number;
    basePriceMultiDay: number;
    advanceType?: "PERCENTAGE" | "FIXED";
    advanceValue?: number;
    loggedInVendorId?: number;
    isSessionBased?: boolean;
    maxSessionHours?: number;
}

/* ---------------------------------- */

export const VendorBookingForm = ({
    vendorId,
    vendorProductId,
    basePriceSingleDay,
    basePriceMultiDay,
    advanceType,
    advanceValue,
    loggedInVendorId,
    isSessionBased = false,
    maxSessionHours = 8,
}: VendorBookingFormProps) => {
    const router = useRouter();

    /* ---------------- State ---------------- */

    const [dateRange, setDateRange] = useState<DateRange>();
    const [startTime, setStartTime] = useState<string>();
    const [sessionHours, setSessionHours] = useState<string>("");

    const [notes, setNotes] = useState("");
    const [couponInput, setCouponInput] = useState("");
    const [couponPreview, setCouponPreview] =
        useState<ValidateCouponResponse | null>(null);

    /* ---------------- Hooks ---------------- */

    const validateCoupon = useValidateVendorCoupon();
    const createBooking = useCreateVendorBooking();
    const { data: availabilityData } = useBookingAvailability(vendorProductId);
    const { data: activeBooking } = useActiveBookingStatus(
        vendorProductId,
        loggedInVendorId ?? 0,
    );

    /* ---------------- Guards ---------------- */

    const isSelfBooking =
        loggedInVendorId !== undefined && loggedInVendorId === vendorId;

    const isAlreadyBookedByMe = activeBooking?.hasActiveBooking ?? false;

    /* ---------------- Multi-day logic ---------------- */

    const isMultiDay =
        !isSessionBased &&
        dateRange?.from &&
        dateRange?.to &&
        !isSameDay(dateRange.from, dateRange.to);

    const totalDays = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return 1;
        return differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
    }, [dateRange]);

    /* ---------------- Pricing ---------------- */

    const baseAmount = useMemo(() => {
        if (isSessionBased) return basePriceSingleDay;

        return isMultiDay ? basePriceMultiDay * totalDays : basePriceSingleDay;
    }, [
        isSessionBased,
        isMultiDay,
        totalDays,
        basePriceSingleDay,
        basePriceMultiDay,
    ]);

    const discountAmount = couponPreview?.discountAmount ?? 0;
    const finalAmount = couponPreview?.finalAmount ?? baseAmount;

    const advanceAmount = useMemo(() => {
        if (!advanceType || !advanceValue) return finalAmount;

        if (advanceType === "PERCENTAGE") {
            return Math.round((finalAmount * advanceValue) / 100);
        }

        return advanceValue;
    }, [finalAmount, advanceType, advanceValue]);

    const remainingAmount = Math.max(finalAmount - advanceAmount, 0);

    /* ---------------- Date disabling ---------------- */

    const isDateDisabled = (date: Date) => {
        const today = startOfDay(new Date());
        const current = startOfDay(date);

        if (isBefore(current, today)) return true;

        return (
            availabilityData?.unavailableRanges.some((range) => {
                const start = startOfDay(new Date(range.startDate));
                const end = startOfDay(new Date(range.endDate));
                return current >= start && current <= end;
            }) ?? false
        );
    };

    /* ---------------- Time slots ---------------- */

    const timeSlots = useMemo(() => {
        const slots: string[] = [];
        for (let h = 0; h < 24; h++) {
            slots.push(`${h.toString().padStart(2, "0")}:00`);
        }
        return slots;
    }, []);

    const hourOptions = useMemo(() => {
        const arr: string[] = [];
        for (let i = 1; i <= maxSessionHours; i++) {
            arr.push(String(i));
        }
        return arr;
    }, [maxSessionHours]);

    /* ---------------- Date change ---------------- */

    const handleDateChange = (range: DateRange | undefined) => {
        if (!range?.from) {
            setDateRange(range);
            return;
        }

        if (isSessionBased) {
            setDateRange({ from: range.from, to: range.from });
            return;
        }

        setDateRange(range);
    };

    /* ---------------- Submit ---------------- */

    const handleSubmit = () => {
        if (!dateRange?.from) {
            toast.error("Please select date");
            return;
        }

        if (isSessionBased) {
            if (!startTime || !sessionHours) {
                toast.error("Select start time and session duration");
                return;
            }
        }

        createBooking.mutate(
            {
                vendorProductId,
                startDate: format(dateRange.from, "yyyy-MM-dd"),
                endDate: format(dateRange.to ?? dateRange.from, "yyyy-MM-dd"),
                startTime: isSessionBased ? startTime : undefined,
                sessionHours: isSessionBased ? Number(sessionHours) : undefined,
                couponCode: couponPreview?.code,
                notes: notes || undefined,
            },
            {
                onSuccess: (data) => {
                    toast.success("Booking request sent");
                    router.push(
                        `/vendor/bookings/requested/${data.booking.uuid}`,
                    );
                },
                onError: (e: any) =>
                    toast.error(e?.message ?? "Something went wrong"),
            },
        );
    };

    if (isSelfBooking) {
        return (
            <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
                <CardContent className="p-6 text-center">
                    <p className="text-destructive font-semibold">
                        You cannot book your own service.
                    </p>
                </CardContent>
            </Card>
        );
    }

    /* ---------------- Render ---------------- */

    return (
        <Card className="rounded-2xl">
            <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">Request Booking</h3>

                {/* Date Picker */}
                <div>
                    <Label className="mb-2 block">
                        {isSessionBased ? "Select Date" : "Select Date(s)"}
                    </Label>

                    <DateRangePicker
                        value={dateRange}
                        onChange={handleDateChange}
                        disabled={isDateDisabled}
                    />
                </div>

                {/* Session Based Time Selection */}
                {isSessionBased && dateRange?.from && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Start Time
                            </Label>

                            <Select
                                value={startTime}
                                onValueChange={setStartTime}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Start" />
                                </SelectTrigger>

                                <SelectContent>
                                    {timeSlots.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="mb-2">Duration (Hours)</Label>

                            <Select
                                value={sessionHours}
                                onValueChange={setSessionHours}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Hours" />
                                </SelectTrigger>

                                <SelectContent>
                                    {hourOptions.map((h) => (
                                        <SelectItem key={h} value={h}>
                                            {h} Hour
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Price Summary */}
                {dateRange?.from && (
                    <Card className="bg-muted/40 rounded-xl">
                        <CardContent className="p-4 text-sm space-y-2">
                            <div className="flex justify-between">
                                <span>Base Price</span>
                                <span>₹{baseAmount.toLocaleString()}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>
                                        -₹
                                        {discountAmount.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between font-semibold border-t pt-2">
                                <span>Advance Payable</span>
                                <span className="text-primary">
                                    ₹{advanceAmount.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between text-muted-foreground">
                                <span>Remaining</span>
                                <span>₹{remainingAmount.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Coupon */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Coupon Code
                    </Label>

                    <div className="flex gap-2">
                        <Input
                            value={couponInput}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setCouponInput(e.target.value.toUpperCase())}
                            disabled={!!couponPreview}
                            placeholder="Enter coupon code"
                        />

                        {!couponPreview ? (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    !couponInput || validateCoupon.isPending
                                }
                                onClick={() =>
                                    validateCoupon.mutate(
                                        {
                                            code: couponInput,
                                            amount: baseAmount,
                                        },
                                        {
                                            onSuccess: (data) => {
                                                setCouponPreview(data);
                                                toast.success("Coupon applied");
                                            },
                                            onError: (error: unknown) => {
                                                if (error instanceof Error) {
                                                    toast.error(error.message);
                                                } else {
                                                    toast.error(
                                                        "Invalid coupon",
                                                    );
                                                }
                                            },
                                        },
                                    )
                                }
                            >
                                Apply
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCouponPreview(null);
                                    setCouponInput("");
                                }}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label>Notes (optional)</Label>

                    <Textarea
                        placeholder="Any special instructions (max 50 words)"
                        value={notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setNotes(e.target.value)
                        }
                        maxLength={250}
                        rows={3}
                    />

                    <p className="text-xs text-muted-foreground">
                        {notes.length}/250 characters
                    </p>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={
                        createBooking.isPending ||
                        isSelfBooking ||
                        isAlreadyBookedByMe
                    }
                    className="w-full bg-gradient-primary rounded-pill"
                >
                    Send Booking Request
                </Button>
            </CardContent>
        </Card>
    );
};
