"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";

type Props = {
    formData: any;
    setFormData: (data: any) => void;
};

export default function BasicInfo({ formData, setFormData }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const profileInputRef = useRef<HTMLInputElement | null>(null);

    const fields = [
        { id: "fullName", label: "Full Name" },
        { id: "businessName", label: "Business Name (optional)" },
        { id: "occupation", label: "Occupation" },
        { id: "phone", label: "Phone Number" },
        { id: "address", label: "Address" },
        { id: "email", label: "Email", type: "email" },
    ];

    return (
        <div className="space-y-4">
            {/* Basic Fields */}
            {fields.map((field) => (
                <div key={field.id}>
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                        id={field.id}
                        type={field.type || "text"}
                        value={formData[field.id]}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                [field.id]: e.target.value,
                            })
                        }
                        className="rounded-xl bg-muted text-foreground border-border"
                    />
                </div>
            ))}

            {/* Years of Experience */}
            <div>
                <Label>Years of Experience</Label>
                <Input
                    type="number"
                    min={0}
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            yearsOfExperience: Number(e.target.value),
                        })
                    }
                    className="rounded-xl bg-muted border-border"
                />
            </div>

            {/* Successful Events */}
            <div>
                <Label>Successful Events Completed</Label>
                <Input
                    type="number"
                    min={0}
                    value={formData.successfulEventsCompleted}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            successfulEventsCompleted: Number(e.target.value),
                        })
                    }
                    className="rounded-xl bg-muted border-border"
                />
            </div>

            {/* Demand Price */}
            <div>
                <Label>Expected Price (Demand Price)</Label>
                <Input
                    type="number"
                    min={0}
                    value={formData.demandPrice}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            demandPrice: Number(e.target.value),
                        })
                    }
                    className="rounded-xl bg-muted border-border"
                />
            </div>

            {/* GST Number (Optional) */}
            <div>
                <Label>GST Number (optional)</Label>
                <Input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            gstNumber: e.target.value,
                        })
                    }
                    className="rounded-xl bg-muted border-border"
                />
            </div>

            {/* Profile Photo */}
            <div className="space-y-2">
                <Label>Profile Photo</Label>

                <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            profilePhoto: e.target.files?.[0] || null,
                        })
                    }
                />

                <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl flex items-center gap-2 justify-center"
                    onClick={() => profileInputRef.current?.click()}
                >
                    <Upload className="w-4 h-4" />
                    {formData.profilePhoto
                        ? "Change Profile Photo"
                        : "Upload Profile Photo"}
                </Button>

                {formData.profilePhoto && (
                    <p className="text-sm text-muted-foreground">
                        Selected: {formData.profilePhoto.name}
                    </p>
                )}
            </div>

            {/* Password */}
            <div>
                <Label>Password</Label>
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            })
                        }
                        className="rounded-xl bg-muted border-border pr-10"
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-2.5 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                </div>
            </div>

            {/* Confirm Password */}
            <div>
                <Label>Confirm Password</Label>
                <div className="relative">
                    <Input
                        type={showConfirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                            })
                        }
                        className="rounded-xl bg-muted border-border pr-10"
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-2.5 text-muted-foreground"
                        onClick={() => setShowConfirm(!showConfirm)}
                    >
                        {showConfirm ? <EyeOff /> : <Eye />}
                    </button>
                </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 pt-2">
                <Input
                    type="checkbox"
                    id="terms"
                    checked={formData.hasAcceptedTerms}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            hasAcceptedTerms: e.target.checked,
                            termsAcceptedAt: e.target.checked
                                ? new Date()
                                : null,
                        })
                    }
                    className="mt-1 h-4 w-4 accent-primary"
                />

                <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <Link
                        href="/vendor-terms-and-conditions"
                        className="text-primary hover:underline"
                    >
                        Vendor Terms & Conditions
                    </Link>
                </Label>
            </div>
        </div>
    );
}
