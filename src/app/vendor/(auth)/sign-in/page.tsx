"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signInVendor } from "@/lib/sign-in/signInVendor";

export default function VendorSignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleSignIn() {
        if (!email.trim() || !password.trim()) {
            toast.error("Please enter your email and password");
            return;
        }

        try {
            setLoading(true);
            await signInVendor({ email, password });
            toast.success("Signed in successfully!");

            router.push("/vendor"); // redirect after login
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-md rounded-2xl shadow-lg border-border bg-card">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Vendor Sign In</CardTitle>
                    <CardDescription>Access your dashboard & manage your bookings</CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">

                    {/* Email */}
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="rounded-xl bg-muted border-border"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rounded-xl bg-muted pr-10 border-border"
                                placeholder="••••••••"
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

                    {/* Forgot Password */}
                    <div className="text-right text-sm">
                        <span>Don&apos;t remember password?{" "}</span> 
                        <a href="/vendor/forgot-password" className="text-primary underline hover:text-primary/80">
                            Forgot password
                        </a>
                    </div>

                    {/* Sign In Button */}
                    <Button
                        className="w-full rounded-full bg-gradient-primary py-6 text-lg"
                        onClick={handleSignIn}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    {/* Register Link */}
                    <p className="text-center text-sm mt-4">
                        Don&apos;t have an account?
                        <a href="/vendor/register" className="text-primary underline ml-1 hover:text-primary/80">
                            Register
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
