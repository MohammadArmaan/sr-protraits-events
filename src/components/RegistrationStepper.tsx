import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";

interface Step {
    number: number;
    title: string;
    description: string;
}

interface RegistrationStepperProps {
    currentStep: number;
    steps: Step[];
}

export const RegistrationStepper = ({
    currentStep,
    steps,
}: RegistrationStepperProps) => {
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [animatingStep, setAnimatingStep] = useState<number | null>(null);

    useEffect(() => {
        if (currentStep <= 1) return;

        const previousStep = currentStep - 1;

        if (!completedSteps.includes(previousStep)) {
            requestAnimationFrame(() => {
                setAnimatingStep(previousStep);

                setTimeout(() => {
                    setCompletedSteps((prev) => [...prev, previousStep]);
                    setAnimatingStep(null);
                }, 600);
            });
        }
    }, [currentStep, completedSteps]);

    return (
        <div className="w-full py-4 sm:py-8">
            <div className="flex items-center justify-between max-w-4xl mx-auto px-2">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                        <div className="flex flex-col justify-center items-center min-w-0">
                            <div
                                className={cn(
                                    "w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
                                    currentStep > step.number
                                        ? "bg-success text-success-foreground shadow-md"
                                        : currentStep === step.number
                                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {currentStep > step.number ? (
                                    <Check
                                        className={cn(
                                            "h-3 w-3 sm:h-5 sm:w-5 md:h-6 md:w-6 transition-all",
                                            animatingStep === step.number
                                                ? "animate-scale-in"
                                                : ""
                                        )}
                                    />
                                ) : (
                                    <span className="text-xs sm:text-base md:text-lg font-bold">
                                        {step.number}
                                    </span>
                                )}
                            </div>
                            <div className="mt-1 sm:mt-3 text-center min-w-0 px-0.5">
                                <p
                                    className={cn(
                                        "text-[10px] sm:text-sm font-medium transition-colors truncate max-w-[60px] sm:max-w-none",
                                        currentStep >= step.number
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {step.title}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden lg:block truncate">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-[2px] mx-0.5 sm:mx-2 md:mx-4 -mt-6 sm:-mt-10 md:-mt-12 bg-muted overflow-hidden min-w-[10px] sm:min-w-[20px]">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-700 ease-in-out",
                                        currentStep > step.number
                                            ? "bg-success w-full"
                                            : "bg-transparent w-0"
                                    )}
                                    style={{
                                        transitionDelay:
                                            animatingStep === step.number
                                                ? "300ms"
                                                : "0ms",
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
