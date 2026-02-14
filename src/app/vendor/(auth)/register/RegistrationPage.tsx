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
    const [catalogTitle, setCatalogTitle] = useState("");
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
        yearsOfExperience: 0,
        successfulEventsCompleted: 0,
        demandPrice: 0,
        gstNumber: "",
        password: "",
        confirmPassword: "",
        otp: "",
        businessDescription: "",
        profilePhoto: null as File | null,
        photos: [] as string[],
        catalogTitle: "",
        categoryId: undefined as number | undefined,
        subCategoryId: undefined as number | undefined,
        verified: false,
        hasAcceptedTerms: false,
        termsAcceptedAt: null as Date | null,
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
                    formData.yearsOfExperience < 0 ||
                    formData.successfulEventsCompleted < 0 ||
                    formData.demandPrice < 0 ||
                    !formData.password.trim() ||
                    !formData.confirmPassword.trim() ||
                    !formData.profilePhoto
                ) {
                    toast.error("Please fill all required fields");
                    return false;
                }
                if (!formData.hasAcceptedTerms) {
                    toast.error(
                        "You must accept the Terms & Conditions to continue",
                    );
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
            try {
                if (!formData.profilePhoto) {
                    toast.error("Profile photo is required");
                    return;
                }

                setLoading(true);

                const form = new FormData();

                form.append("fullName", formData.fullName);
                form.append("businessName", formData.businessName || "");
                form.append("occupation", formData.occupation);
                form.append("phone", formData.phone);
                form.append("address", formData.address);
                form.append("email", formData.email);

                form.append(
                    "yearsOfExperience",
                    String(formData.yearsOfExperience),
                );
                form.append(
                    "successfulEventsCompleted",
                    String(formData.successfulEventsCompleted),
                );
                form.append("demandPrice", String(formData.demandPrice));

                if (formData.gstNumber) {
                    form.append("gstNumber", formData.gstNumber);
                }

                form.append("password", formData.password);
                form.append("confirmPassword", formData.confirmPassword);

                // 🔥 FILE MUST BE APPENDED LIKE THIS
                form.append("profilePhoto", formData.profilePhoto);

                form.append(
                    "hasAcceptedTerms",
                    String(formData.hasAcceptedTerms),
                );

                if (formData.termsAcceptedAt) {
                    form.append(
                        "termsAcceptedAt",
                        formData.termsAcceptedAt.toISOString(),
                    );
                }

                const result = await submitBasicInfo(form);

                sessionStorage.setItem(
                    "onboardingToken",
                    result.onboardingToken,
                );
                toast.success("OTP sent to your email!");
                setCurrentStep(2);
            } catch (err) {
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
                await submitDescription({
                    businessDescription: formData.businessDescription,
                });
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
                if (!formData.catalogTitle.trim()) {
                    toast.error("Catalog title is required");
                    return;
                }

                if (!formData.categoryId) {
                    toast.error("Please select a category");
                    return;
                }

                if (!formData.subCategoryId) {
                    toast.error("Please select a subcategory");
                    return;
                }

                await submitPhotos({
                    photos: photoFiles,
                    catalogTitle: formData.catalogTitle,
                    categoryId: formData.categoryId!,
                    subCategoryId: formData.subCategoryId!,
                });
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
                        <Link
                            href="/vendor/sign-in"
                            className="text-primary hover:underline ml-1 hover:text-primary/80"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>

                <RegistrationStepper currentStep={currentStep} steps={steps} />

                <Card className="border-border shadow-lg rounded-2xl bg-card text-card-foreground">
                    <CardHeader>
                        <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                        <CardDescription>
                            {steps[currentStep - 1].description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {currentStep === 1 && (
                            <BasicInfo
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {currentStep === 2 && (
                            <VerifyEmail
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {currentStep === 3 && (
                            <Description
                                formData={{
                                    businessDescription:
                                        formData.businessDescription,
                                }}
                                setFormData={(data) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        ...data,
                                    }))
                                }
                            />
                        )}

                        {currentStep === 4 && (
                            <UploadPhotos
                                files={photoFiles}
                                previews={photoPreviews}
                                setFiles={setPhotoFiles}
                                setPreviews={setPhotoPreviews}
                                catalogTitle={formData.catalogTitle}
                                setCatalogTitle={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        catalogTitle: value,
                                    }))
                                }
                                categoryId={formData.categoryId}
                                subCategoryId={formData.subCategoryId}
                                setCategoryId={(id) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        categoryId: id,
                                        subCategoryId: undefined, // reset
                                    }))
                                }
                                setSubCategoryId={(id) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        subCategoryId: id,
                                    }))
                                }
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
