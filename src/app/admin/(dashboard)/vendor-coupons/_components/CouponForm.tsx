"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
    VendorCoupon,
    VendorCouponFormPayload,
    VendorCouponType,
} from "@/types/admin/vendor-cupon";

/* ----------------------------
   Type helpers
----------------------------- */
const COUPON_TYPES: VendorCouponType[] = ["FLAT", "PERCENT", "UPTO"];

function isVendorCouponType(value: string): value is VendorCouponType {
    return COUPON_TYPES.includes(value as VendorCouponType);
}

/* ----------------------------
   Props
----------------------------- */
interface Props {
    coupon: VendorCoupon | null;
    onSubmit: (data: VendorCouponFormPayload) => void;
    onCancel: () => void;
}

/* ----------------------------
   Component
----------------------------- */
export function CouponForm({ coupon, onSubmit, onCancel }: Props) {
    const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

    const [form, setForm] = useState<VendorCouponFormPayload>({
        code: "",
        type: "PERCENT",
        value: 0,
        minAmount: null,
        maxDiscount: null,
        isActive: true,
        expiresAt: "",
    });

    /* ----------------------------
     Prefill on edit
  ----------------------------- */
    useEffect(() => {
        if (!coupon) return;

        setForm({
            code: coupon.code,
            type: coupon.type,
            value: Number(coupon.value),
            minAmount: coupon.minAmount,
            maxDiscount: coupon.maxDiscount,
            isActive: coupon.isActive,
            expiresAt: coupon.expiresAt,
        });

        setExpiryDate(new Date(coupon.expiresAt));
    }, [coupon]);

    /* ----------------------------
     Submit
  ----------------------------- */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSubmit({
            ...form,
            expiresAt: expiryDate?.toISOString() ?? "",
            minAmount: form.minAmount ?? null,
            maxDiscount: form.maxDiscount ?? null,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Coupon Code */}
            <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                    id="code"
                    value={form.code}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            code: e.target.value.toUpperCase(),
                        }))
                    }
                    placeholder="e.g., REPUBLIC26"
                    className="mt-1.5 font-mono uppercase"
                    required
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Enter a unique code customers will apply at checkout
                </p>
            </div>

            {/* Discount Type */}
            <div>
                <Label>Discount Type</Label>
                <Select
                    value={form.type}
                    onValueChange={(value) => {
                        if (isVendorCouponType(value)) {
                            setForm((prev) => ({
                                ...prev,
                                type: value,
                                maxDiscount:
                                    value === "UPTO" ? prev.maxDiscount : null,
                            }));
                        }
                    }}
                >
                    <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FLAT">
                            <div className="flex flex-col">
                                <span>Flat Discount</span>
                                <span className="text-xs text-muted-foreground">
                                    Fixed amount off (₹500 off)
                                </span>
                            </div>
                        </SelectItem>

                        <SelectItem value="PERCENT">
                            <div className="flex flex-col">
                                <span>Percentage Discount</span>
                                <span className="text-xs text-muted-foreground">
                                    % off total amount
                                </span>
                            </div>
                        </SelectItem>

                        <SelectItem value="UPTO">
                            <div className="flex flex-col">
                                <span>Up To (Capped)</span>
                                <span className="text-xs text-muted-foreground">
                                    % off with max discount cap
                                </span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Value + Max Discount */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>
                        {form.type === "FLAT"
                            ? "Discount Amount (₹)"
                            : "Discount Percentage (%)"}
                    </Label>
                    <Input
                        type="number"
                        value={form.value || ""}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                value: Number(e.target.value),
                            }))
                        }
                        placeholder={form.type === "FLAT" ? "500" : "20"}
                        className="mt-1.5"
                        min={0}
                        max={form.type !== "FLAT" ? 100 : undefined}
                        required
                    />
                </div>

                {form.type === "UPTO" && (
                    <div>
                        <Label>Maximum Discount (₹)</Label>
                        <Input
                            type="number"
                            value={form.maxDiscount ?? ""}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    maxDiscount: Number(e.target.value) || null,
                                }))
                            }
                            placeholder="1000"
                            className="mt-1.5"
                            min={0}
                            required
                        />
                    </div>
                )}
            </div>

            {/* Min Order */}
            <div>
                <Label>Minimum Order Value (₹) – Optional</Label>
                <Input
                    type="number"
                    value={form.minAmount ?? ""}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            minAmount: Number(e.target.value) || null,
                        }))
                    }
                    placeholder="e.g., 1000"
                    className="mt-1.5"
                    min={0}
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Leave empty if no minimum is required
                </p>
            </div>

            {/* Expiry Date */}
            <div>
                <Label>Expiry Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal mt-1.5",
                                !expiryDate && "text-muted-foreground",
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {expiryDate
                                ? format(expiryDate, "PPP")
                                : "Select expiry date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={expiryDate}
                            onSelect={setExpiryDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
                <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, isActive: checked }))
                    }
                />
                <Label className="cursor-pointer">Coupon is Active</Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-primary text-primary-foreground"
                >
                    {coupon ? "Update Coupon" : "Create Coupon"}
                </Button>
            </div>
        </form>
    );
}
