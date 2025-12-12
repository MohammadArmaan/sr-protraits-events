"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import BasicInfo from "./steps/BasicInfo";
import { RegistrationStepper } from "@/components/vendor/RegistrationStepper";
import { VendorBasicInfo } from "@/types/vendor-registration";
import { submitBasicInfo } from "@/lib/register/submitBasicInfo";
import VerifyEmail from "./steps/VerifyEmail";
import { submitDescription } from "@/lib/register/submitDescription";
import Description from "./steps/Description";
import UploadPhotos from "./steps/UploadPhotos";
import { submitPhotos } from "@/lib/register/submitPhotos";
import Complete from "./steps/Complete";
import { finishRegistration } from "@/lib/register/finishRegistration";
import { useRouter } from "next/navigation";
import Link from "next/link";

const steps = [
    { number: 1, title: "Basic Info", description: "Personal details" },
    { number: 2, title: "Verification", description: "Email OTP" },
    { number: 3, title: "Description", description: "Business info" },
    { number: 4, title: "Photos", description: "Upload images" },
    { number: 5, title: "Complete", description: "All done!" },
];

export default function RegistrationPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: "",
        businessName: "",
        occupation: "",
        phone: "",
        address: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: "",
        businessDescription: "",
        photos: [] as string[],
        verified: false,
    });

    /** ---------------- VALIDATE STEP ---------------- */
    const validateStep = () => {
        switch (currentStep) {
            case 1:
                if (
                    !formData.fullName.trim() ||
                    !formData.occupation.trim() ||
                    !formData.phone.trim() ||
                    !formData.address.trim() ||
                    !formData.email.trim() ||
                    !formData.password.trim() ||
                    !formData.confirmPassword.trim()
                ) {
                    toast.error("Please fill all required fields");
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    toast.error("Passwords do not match");
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    /** ---------------- NEXT BUTTON ---------------- */
    async function handleNext() {
        if (!validateStep()) return;

        if (currentStep === 1) {
            const payload: VendorBasicInfo = {
                fullName: formData.fullName,
                businessName: formData.fullName,
                occupation: formData.occupation,
                phone: formData.phone,
                address: formData.address,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            };

            try {
                setLoading(true);
                const result = await submitBasicInfo(payload);
                sessionStorage.setItem("onboardingToken", result.onboardingToken);
                toast.success("OTP sent to your email!");
                setCurrentStep(2);
            } catch (err: unknown) {
                if (err instanceof Error) toast.error(err.message);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (currentStep === 2) {
            if (!formData.verified) {
                toast.error("Please verify your email first.");
                return;
            }
            setCurrentStep(3);
            return;
        }

        if (currentStep === 3) {
            try {
                setLoading(true);
                await submitDescription({ businessDescription: formData.businessDescription });
                toast.success("Description saved!");
                setCurrentStep(4);
            } catch (err: unknown) {
                if (err instanceof Error) toast.error(err.message);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (currentStep === 4) {
            try {
                setLoading(true);
                if (photoFiles.length === 0) {
                    toast.error("Please upload at least one image");
                    return;
                }
                await submitPhotos({ photos: photoFiles });
                toast.success("Photos uploaded!");
                setCurrentStep(5);
            } catch (err) {
                if (err instanceof Error) toast.error(err.message);
            } finally {
                setLoading(false);
            }
            return;
        }

        // Step 5 handled inside <Complete/>
    }

    /** ---------------- BACK BUTTON ---------------- */
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4 transition-colors">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        Vendor Registration
                    </h1>

                    <p className="text-muted-foreground">
                        Already a vendor?
                        <Link href="/vendor/sign-in" className="text-primary hover:underline ml-1 hover:text-primary/80">
                            Sign In
                        </Link>
                    </p>
                </div>

                <RegistrationStepper currentStep={currentStep} steps={steps} />

                <Card className="border-border shadow-lg rounded-2xl bg-card text-card-foreground">
                    <CardHeader>
                        <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                        <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">

                        {currentStep === 1 && (
                            <BasicInfo formData={formData} setFormData={setFormData} />
                        )}

                        {currentStep === 2 && (
                            <VerifyEmail formData={formData} setFormData={setFormData} />
                        )}

                        {currentStep === 3 && (
                            <Description
                                formData={{ businessDescription: formData.businessDescription }}
                                setFormData={(data) =>
                                    setFormData((prev) => ({ ...prev, ...data }))
                                }
                            />
                        )}

                        {currentStep === 4 && (
                            <UploadPhotos
                                files={photoFiles}
                                previews={photoPreviews}
                                setFiles={setPhotoFiles}
                                setPreviews={setPhotoPreviews}
                            />
                        )}

                        {currentStep === 5 && (
                            <Complete
                                onFinish={async () => {
                                    try {
                                        setLoading(true);
                                        await finishRegistration();
                                    } catch {}
                                    setLoading(false);
                                    router.push("/");
                                }}
                            />
                        )}

                        {/* --------- BUTTONS --------- */}
                        <div className="flex justify-between pt-6">
                            {/* Next button */}
                            {currentStep < 5 && (
                                <Button
                                    className="rounded-full bg-gradient-primary font-semibold px-8 py-3 text-lg w-full sm:w-auto"
                                    onClick={handleNext}
                                    disabled={loading}
                                >
                                    {loading ? "Please wait..." : "Next"}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
