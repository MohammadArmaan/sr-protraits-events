"use client";

import { useRef, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { verifyEmail } from "@/lib/register/verifyEmail";
import { toast } from "sonner";
import axios from "axios";

type Props = {
    formData: {
        otp: string;
        email: string;
        verified?: boolean;
    };
    setFormData: (d: any) => void;
};

export default function VerifyEmail({ formData, setFormData }: Props) {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const [timer, setTimer] = useState(60); // 60 sec cooldown

    // ---------------- TIMER COUNTDOWN ----------------
    useEffect(() => {
        if (timer <= 0) return;

        const id = setTimeout(() => setTimer((t) => t - 1), 1000);
        return () => clearTimeout(id);
    }, [timer]);

    // ---------------- PASTE HANDLER ----------------
    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        
        if (pastedData.length === 6) {
            setFormData({ ...formData, otp: pastedData });
            
            // Focus the last input
            inputsRef.current[5]?.focus();
        }
    }

    // ---------------- OTP HANDLERS ----------------
    function handleOtpChange(index: number, value: string) {
        const sanitized = value.replace(/\D/g, "").slice(0, 1);
        if (!sanitized) return;

        const otpArray = formData.otp.split("");
        otpArray[index] = sanitized;

        setFormData({ ...formData, otp: otpArray.join("") });

        if (index < 5 && inputsRef.current[index + 1]) {
            inputsRef.current[index + 1]!.focus();
        }
    }

    function handleBackspace(
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) {
        if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    }

    // ---------------- VERIFY OTP ----------------
    async function handleVerifyOtp() {
        if (formData.otp.length !== 6) {
            toast.error("Enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            await verifyEmail({ otp: formData.otp });

            toast.success("Email verified!");

            setFormData((prev: any) => ({
                ...prev,
                verified: true,
            }));
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    // ---------------- RESEND OTP ----------------
    async function handleResend() {
        const onboardingToken = sessionStorage.getItem("onboardingToken");
        if (!onboardingToken) {
            toast.error("Missing onboarding token.");
            return;
        }

        setResendLoading(true);

        try {
            await axios.post("/api/vendors/resend-otp", {
                onboardingToken,
            });

            toast.success("OTP resent to your email!");
            setTimer(60); // reset cooldown
        } catch {
            toast.error("Failed to resend OTP.");
        } finally {
            setResendLoading(false);
        }
    }

    // ---------------- VERIFIED SCREEN ----------------
    if (formData.verified) {
        return (
            <div className="text-center py-8">
                <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />

                <h3 className="text-xl font-semibold">Email verified!</h3>
                <p className="text-muted-foreground mb-4">
                    Click Next to continue.
                </p>
            </div>
        );
    }

    // ---------------- OTP INPUT SCREEN ----------------
    return (
        <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
                Enter the OTP sent to <strong>{formData.email}</strong>
            </p>

            <Label>Email OTP</Label>

            <div className="flex gap-3 justify-center mb-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputsRef.current[index] = el;
                        }}
                        maxLength={1}
                        value={formData.otp[index] || ""}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleBackspace(e, index)}
                        onPaste={handlePaste}
                        className="
        w-12 h-14 text-center text-xl font-semibold 
        bg-muted border border-border rounded-xl
        focus:ring-2 focus:ring-primary focus:border-primary
        outline-none
    "
                    />
                ))}
            </div>

            {/* Verify Button */}
            <Button
                className="rounded-pill bg-gradient-primary w-full max-w-xs mx-auto"
                onClick={handleVerifyOtp}
                disabled={loading}
            >
                {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            {/* Resend OTP */}
            <div className="mt-4 text-sm text-muted-foreground">
                {timer > 0 ? (
                    <p>
                        Resend OTP in <strong>{timer}s</strong>
                    </p>
                ) : (
                    <button
                        className="text-primary underline"
                        onClick={handleResend}
                        disabled={resendLoading}
                    >
                        {resendLoading ? "Sending..." : "Resend OTP"}
                    </button>
                )}
            </div>
        </div>
    );
}