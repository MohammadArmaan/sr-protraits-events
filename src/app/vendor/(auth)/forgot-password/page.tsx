"use client";

import { useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/sign-in/requestPasswordReset";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!email.trim()) return toast.error("Enter your email.");

        setLoading(true);
        try {
            await requestPasswordReset(email);
            toast.success("Reset link sent to your email!");
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <Card className="w-full max-w-md p-6 shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        Forgot Password
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to receive a reset link.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            className="rounded-xl bg-muted border-border"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full rounded-full bg-gradient-primary py-6"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <p className="text-sm text-center mt-3">
                        Remember password?{" "}
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
