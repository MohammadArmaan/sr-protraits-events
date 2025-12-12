"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

type Props = {
    formData: any;
    setFormData: (data: any) => void;
};

export default function BasicInfo({ formData, setFormData }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const fields = [
        { id: "fullName", label: "Full Name" },
        { id: "businessName", label: "Business Name" },
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
        </div>
    );
}
