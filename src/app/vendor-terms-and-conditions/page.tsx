"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function VendorTermsAndConditionsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-16">
            <div className="max-w-4xl mx-auto px-6 space-y-10">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Vendor Terms & Conditions
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Please review these terms carefully before using our
                        platform as a registered vendor.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Last Updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Content Card */}
                <Card className="p-8 md:p-10 rounded-2xl shadow-sm border space-y-8">
                    {/* Section 1 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By registering as a vendor on our platform, you
                            agree to comply with these Terms & Conditions. If
                            you do not agree with any part of these terms, you
                            may not access or use vendor features.
                        </p>
                    </section>

                    <Separator />

                    {/* Section 2 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">
                            2. Vendor Responsibilities
                        </h2>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2 leading-relaxed">
                            <li>
                                Provide accurate business information and
                                maintain updated profile details.
                            </li>
                            <li>
                                Deliver services professionally and fulfill
                                bookings as agreed.
                            </li>
                            <li>
                                Comply with all applicable laws and tax
                                regulations.
                            </li>
                            <li>
                                Avoid misleading advertisements or fraudulent
                                activity.
                            </li>
                        </ul>
                    </section>

                    <Separator />

                    {/* Section 3 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">
                            3. Payments & Fees
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Vendors may receive payments through integrated
                            payment gateways. Platform service fees,
                            commissions, or other applicable charges may apply
                            and will be transparently communicated.
                        </p>
                    </section>

                    <Separator />

                    {/* Section 4 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">
                            4. Booking & Cancellation Policy
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Vendors are expected to honor confirmed bookings.
                            Cancellation policies should be clearly stated in
                            your listing. Repeated cancellations or misconduct
                            may result in account suspension.
                        </p>
                    </section>

                    <Separator />

                    {/* Section 5 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">
                            5. Content & Intellectual Property
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Vendors retain ownership of their uploaded content
                            but grant the platform a non-exclusive license to
                            display, promote, and market listings within the
                            marketplace.
                        </p>
                    </section>

                    <Separator />

                    {/* Section 6 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">
                            6. Account Suspension & Termination
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to suspend or terminate vendor
                            accounts that violate these terms, engage in
                            fraudulent behavior, or negatively impact user
                            trust.
                        </p>
                    </section>

                    <Separator />

                    {/* Section 7 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">
                            7. Limitation of Liability
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The platform acts as a marketplace facilitator and
                            is not responsible for disputes arising directly
                            between vendors and customers.
                        </p>
                    </section>

                    <Separator />

                    {/* Section 8 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">
                            8. Changes to Terms
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            These Terms & Conditions may be updated
                            periodically. Continued use of the platform
                            constitutes acceptance of any revised terms.
                        </p>
                    </section>
                </Card>

                {/* Footer Note */}
                <div className="text-center text-sm text-muted-foreground">
                    For any questions regarding these terms, please contact our
                    support team.
                </div>
            </div>
        </div>
    );
}
