"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { resetPassword } from "@/lib/sign-in/resetPassword";

export default function ResetPasswordPage() {
    const router = useRouter();

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!token) {
        return (
            <div className="text-center p-10 text-red-500">
                Invalid or missing reset token.
            </div>
        );
    }

    async function handleReset() {
        if (!password.trim() || !confirm.trim()) {
            return toast.error("Enter both fields");
        }
        if (password !== confirm) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);
        try {
            await resetPassword({
                token: token!,
                password,
                confirmPassword: confirm,
            });
            toast.success("Password reset successful!");
            setTimeout(() => {
                router.push("/vendor/sign-in");
            }, 1500);

        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <Card className="w-full max-w-md p-6 rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter a new password.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Password */}
                    <div>
                        <Label>New Password</Label>
                        <div className="relative">
                            <Input
                                type={showPass ? "text" : "password"}
                                className="rounded-xl bg-muted pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                className="absolute right-3 top-2.5 text-muted-foreground"
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                            >
                                {showPass ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm */}
                    <div>
                        <Label>Confirm Password</Label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? "text" : "password"}
                                className="rounded-xl bg-muted pr-10"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                            />
                            <button
                                className="absolute right-3 top-2.5"
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                {showConfirm ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    <Button
                        className="w-full rounded-full bg-gradient-primary py-6"
                        disabled={loading}
                        onClick={handleReset}
                    >
                        {loading ? "Saving..." : "Reset Password"}
                    </Button>

                    <p className="text-center text-sm mt-4">
                        Return to{" "}
                        <Link
                            href="/vendor/sign-in"
                            className="text-primary underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
