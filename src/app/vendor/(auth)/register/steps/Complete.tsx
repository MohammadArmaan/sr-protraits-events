"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    onFinish: () => void;
};

export default function Complete({ onFinish }: Props) {
    return (
        <div className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-16 w-16 text-success" />
            </div>

            <h2 className="text-3xl font-bold mb-2">Registration Complete!</h2>

            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Thank you for submitting your vendor application.  
                Our team will review your profile, and you will receive an approval email within <span className="font-bold">24 hours.</span>
            </p>

            <Button
                className="rounded-full bg-gradient-primary px-8 py-6 shadow-md"
                onClick={onFinish}
            >
                Go to Home
            </Button>
        </div>
    );
}
