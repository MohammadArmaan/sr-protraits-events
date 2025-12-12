"use client";

import { useState } from "react";
import { adminLogin } from "@/lib/admin/login";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!email.trim() || !password.trim()) {
            return toast.error("Please fill all fields");
        }

        setLoading(true);
        try {
            await adminLogin({ email, password });
            toast.success("Login successful");
            router.push("/admin/dashboard");
        } catch (error) {
            // 🔥 Type-safe error handling (no more ANY)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error || "Login failed");
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Login failed");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md shadow-xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
                    <CardDescription className="text-center">
                        Secure access to the admin dashboard
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Email */}
                    <Input
                        placeholder="Admin Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl"
                    />

                    {/* Password */}
                    <div className="relative">
                        <Input
                            placeholder="Password"
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="rounded-xl pr-10"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-2.5 text-muted-foreground"
                            onClick={() => setShow(!show)}
                        >
                            {show ? <EyeOff /> : <Eye />}
                        </button>
                    </div>

                    {/* Login Button */}
                    <Button
                        className="w-full rounded-full bg-gradient-primary py-6"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? "Please wait..." : "Login"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
