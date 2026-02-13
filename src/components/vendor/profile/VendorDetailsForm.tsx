"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
    data: {
        fullName: string;
        businessName: string;
        occupation: string;
        phone: string;
        address: string;
        businessDescription: string;
        email: string;
        points?: number;

        yearsOfExperience: number;
        successfulEventsCompleted: number;
        gstNumber?: string | null;
    };
    disabled: boolean;
    readOnlyEmail?: boolean;
    onChange: (field: string, value: string | number) => void;
}

export function VendorDetailsForm({
    data,
    disabled,
    onChange,
    readOnlyEmail,
}: Props) {
    return (
        <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Full Name</Label>
                    <Input
                        value={data.fullName}
                        disabled={disabled}
                        onChange={(e) => onChange("fullName", e.target.value)}
                        className="rounded-xl"
                    />
                </div>

                <div>
                    <Label>Email</Label>
                    <Input
                        value={data.email}
                        disabled={disabled || readOnlyEmail}
                        className="rounded-xl bg-muted cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Occupation</Label>
                    <Input
                        value={data.occupation}
                        disabled={disabled}
                        onChange={(e) => onChange("occupation", e.target.value)}
                        className="rounded-xl"
                    />
                </div>

                <div>
                    <Label>Phone</Label>
                    <Input
                        value={data.phone}
                        disabled={disabled}
                        onChange={(e) => onChange("phone", e.target.value)}
                        className="rounded-xl"
                    />
                </div>
            </div>

            <div>
                <Label>Address</Label>
                <Input
                    value={data.address}
                    disabled={disabled}
                    onChange={(e) => onChange("address", e.target.value)}
                    className="rounded-xl"
                />
            </div>

            <div>
                <Label>Business Name</Label>
                <Input
                    value={data.businessName}
                    disabled={disabled}
                    onChange={(e) => onChange("businessName", e.target.value)}
                    className="rounded-xl"
                />
            </div>

            {/* Professional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Years of Experience</Label>
                    <Input
                        type="number"
                        min={0}
                        value={data.yearsOfExperience}
                        disabled={disabled}
                        onChange={(e) =>
                            onChange(
                                "yearsOfExperience",
                                Number(e.target.value),
                            )
                        }
                        className="rounded-xl"
                    />
                </div>

                <div>
                    <Label>Successful Events Completed</Label>
                    <Input
                        type="number"
                        min={0}
                        value={data.successfulEventsCompleted}
                        disabled={disabled}
                        onChange={(e) =>
                            onChange(
                                "successfulEventsCompleted",
                                Number(e.target.value),
                            )
                        }
                        className="rounded-xl"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>GST Number (optional)</Label>
                    <Input
                        value={data.gstNumber ?? ""}
                        disabled={disabled}
                        onChange={(e) => onChange("gstNumber", e.target.value)}
                        className="rounded-xl"
                    />
                </div>

                <div>
                    <Label>Points</Label>
                    <Input
                        value={data.points}
                        disabled={disabled || readOnlyEmail}
                        className="rounded-xl bg-muted cursor-not-allowed"
                    />
                </div>
            </div>

            <div>
                <Label>Business Description</Label>
                <Textarea
                    value={data.businessDescription}
                    disabled={disabled}
                    onChange={(e) =>
                        onChange("businessDescription", e.target.value)
                    }
                    className="rounded-xl min-h-[120px]"
                />
            </div>
        </div>
    );
}
