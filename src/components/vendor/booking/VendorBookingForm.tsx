"use client";

import { useMemo, useState } from "react";
import {
    differenceInCalendarDays,
    isBefore,
    isSameDay,
    startOfDay,
    format,
} from "date-fns";
import { Clock, Tag } from "lucide-react";
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

/* ----------------------------------
 Types
---------------------------------- */
interface VendorBookingFormProps {
    vendorId: number;
    vendorProductId: number;
    basePriceSingleDay: number;
    basePriceMultiDay: number;
    advanceType?: "PERCENTAGE" | "FIXED";
    advanceValue?: number;
    loggedInVendorId?: number;
}

/* ----------------------------------
 Constants
---------------------------------- */
const MIN_HOUR = 9;
const MAX_HOUR = 21;
const MAX_DAYS = 5;

/* ----------------------------------
 Component
---------------------------------- */
export const VendorBookingForm = ({
    vendorId,
    vendorProductId,
    basePriceSingleDay,
    basePriceMultiDay,
    advanceType,
    advanceValue,
    loggedInVendorId,
}: VendorBookingFormProps) => {
    const router = useRouter();

    /* ---------------- State ---------------- */
    const [dateRange, setDateRange] = useState<DateRange>();
    const [startTime, setStartTime] = useState<string>();
    const [endTime, setEndTime] = useState<string>();
    const [notes, setNotes] = useState("");

    const [couponInput, setCouponInput] = useState("");
    const [couponPreview, setCouponPreview] =
        useState<ValidateCouponResponse | null>(null);

    /* ---------------- Hooks ---------------- */
    const validateCoupon = useValidateVendorCoupon();
    const createBooking = useCreateVendorBooking();

    const { data: availabilityData } =
        useBookingAvailability(vendorProductId);

    const { data: activeBooking } = useActiveBookingStatus(
        vendorProductId,
        loggedInVendorId ?? 0
    );

    /* ---------------- Guards ---------------- */
    const isSelfBooking =
        loggedInVendorId !== undefined && loggedInVendorId === vendorId;

    const isAlreadyBookedByMe = activeBooking?.hasActiveBooking ?? false;

    /* ---------------- Derived state ---------------- */
    const isMultiDay =
        dateRange?.from && dateRange?.to
            ? !isSameDay(dateRange.from, dateRange.to)
            : false;

    const totalDays = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return 1;
        return differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
    }, [dateRange]);

    const baseAmount = useMemo(() => {
        return isMultiDay
            ? basePriceMultiDay * totalDays
            : basePriceSingleDay;
    }, [isMultiDay, totalDays, basePriceSingleDay, basePriceMultiDay]);

    /* ---------------- Pricing ---------------- */
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

    /* ---------------- Disable dates ---------------- */
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
        for (let h = MIN_HOUR; h <= MAX_HOUR; h++) {
            slots.push(`${h.toString().padStart(2, "0")}:00`);
        }
        return slots;
    }, []);

    /* ---------------- Date change ---------------- */
    const handleDateChange = (range: DateRange | undefined) => {
        if (range?.from && range?.to) {
            const days =
                differenceInCalendarDays(range.to, range.from) + 1;

            if (days > MAX_DAYS) {
                toast.error(`Maximum booking duration is ${MAX_DAYS} days`);
                return;
            }
        }

        setDateRange(range);

        if (range?.from && range?.to && !isSameDay(range.from, range.to)) {
            setStartTime(undefined);
            setEndTime(undefined);
        }
    };

    /* ---------------- Submit ---------------- */
    const handleSubmit = () => {
        if (!dateRange?.from) {
            toast.error("Please select date");
            return;
        }

        if (!isMultiDay && (!startTime || !endTime)) {
            toast.error("Please select start and end time");
            return;
        }

        createBooking.mutate(
            {
                vendorProductId,
                startDate: format(dateRange.from, "yyyy-MM-dd"),
                endDate: format(dateRange.to ?? dateRange.from, "yyyy-MM-dd"),
                startTime: isMultiDay ? undefined : startTime,
                endTime: isMultiDay ? undefined : endTime,
                couponCode: couponPreview?.code,
                notes: notes || undefined,
            },
            {
                onSuccess: (data) => {
                    toast.success("Booking request sent");
                    router.push(
                        `/vendor/bookings/requested/${data.booking.uuid}`
                    );
                },
                onError: (e) => toast.error(e.message),
            }
        );
    };

    /* ---------------- Render ---------------- */
    return (
        <Card className="rounded-2xl">
            <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">Request Booking</h3>

                {/* Date picker */}
                <div>
                    <Label className="mb-2 block">Select Date(s)</Label>
                    <DateRangePicker
                        value={dateRange}
                        onChange={handleDateChange}
                        disabled={isDateDisabled}
                    />
                </div>

                {/* Time slots */}
                {!isMultiDay && dateRange?.from && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Start Time
                            </Label>
                            <Select value={startTime} onValueChange={setStartTime}>
                                <SelectTrigger>
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
                            <Label className="mb-2">End Time</Label>
                            <Select value={endTime} onValueChange={setEndTime}>
                                <SelectTrigger>
                                    <SelectValue placeholder="End" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((t) => (
                                        <SelectItem
                                            key={t}
                                            value={t}
                                            disabled={startTime ? t <= startTime : false}
                                        >
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Coupon */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Coupon Code
                    </Label>

                    <div className="flex gap-2">
                        <Input
                            value={couponInput}
                            onChange={(e) =>
                                setCouponInput(e.target.value.toUpperCase())
                            }
                            disabled={!!couponPreview}
                        />

                        {!couponPreview ? (
                            <Button
                                variant="outline"
                                disabled={!couponInput || validateCoupon.isPending}
                                onClick={() =>
                                    validateCoupon.mutate(
                                        { code: couponInput, amount: baseAmount },
                                        {
                                            onSuccess: (data) => {
                                                setCouponPreview(data);
                                                toast.success("Coupon applied");
                                            },
                                            onError: (e) =>
                                                toast.error(e.message),
                                        }
                                    )
                                }
                            >
                                Apply
                            </Button>
                        ) : (
                            <Button
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
                    <Input
                        placeholder="Any special instructions (max 50 words)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

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
                                    <span>-₹{discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between font-semibold border-t pt-2">
                                <span>Advance Payable (now)</span>
                                <span className="text-primary">
                                    ₹{advanceAmount.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between text-muted-foreground">
                                <span>Remaining (after event)</span>
                                <span>₹{remainingAmount.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isSelfBooking && (
                    <p className="text-sm text-destructive">
                        You cannot book your own service.
                    </p>
                )}

                {isAlreadyBookedByMe && (
                    <p className="text-sm text-destructive">
                        You already have an active booking.
                    </p>
                )}

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
