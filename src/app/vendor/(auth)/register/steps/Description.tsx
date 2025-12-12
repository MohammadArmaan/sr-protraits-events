"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VendorBusinessDescription } from "@/types/vendor-registration";

type Props = {
    formData: VendorBusinessDescription;
    setFormData: (data: VendorBusinessDescription) => void;
};

export default function Description({ formData, setFormData }: Props) {
    return (
        <div className="space-y-4">
            <Label htmlFor="description">Business Description</Label>

            <Textarea
                id="description"
                placeholder="Describe your business, services, style, and experience..."
                minLength={20}
                className="rounded-xl min-h-[180px] bg-muted border-border"
                value={formData.businessDescription}
                onChange={(e) => 
                    setFormData({ businessDescription: e.target.value })
                }
            />

            <p className="text-sm text-muted-foreground text-right">
                {formData.businessDescription.length}/500
            </p>
        </div>
    );
}
