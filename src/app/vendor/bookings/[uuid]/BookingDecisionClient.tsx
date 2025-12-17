"use client";

import { format, isBefore } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Clock, CreditCard, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useBookingDecisionDetails } from "@/hooks/queries/useBookingDecisionDetails";
import { useBookingDecision } from "@/hooks/queries/useBookingDecision";
import { BookingDecisionSkeleton } from "@/components/skeleton/BookingDecisionSkeleton";

interface Props {
    uuid: string;
}

export function BookingDecisionClient({ uuid }: Props) {
    const router = useRouter();

    const { data, isLoading, error } = useBookingDecisionDetails(uuid);
    const decisionMutation = useBookingDecision(uuid);

    if (isLoading) return <BookingDecisionSkeleton />;

    if (error || !data) {
        return (
            <div className="pt-28 text-center text-destructive">
                Failed to load booking
            </div>
        );
    }

    const { booking } = data;

    const isExpired = isBefore(new Date(booking.approvalExpiresAt), new Date());

    const isActionable = booking.status === "REQUESTED" && !isExpired;

    const isFinalState =
        booking.status === "APPROVED" || booking.status === "REJECTED";

    const handleDecision = (decision: "APPROVE" | "REJECT") => {
        decisionMutation.mutate(decision, {
            onSuccess: () => {
                toast.success(
                    decision === "APPROVE"
                        ? "Booking approved"
                        : "Booking rejected"
                );
            },
            onError: (e) => toast.error(e.message),
        });
    };

    return (
        <main className="pt-28 px-4 pb-16">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card className="rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                        <h1 className="text-2xl font-bold">Booking Request</h1>

                        {/* Status Badge */}
                        <Badge
                            variant={
                                booking.status === "REJECTED"
                                    ? "destructive"
                                    : booking.status === "APPROVED"
                                    ? "secondary"
                                    : "outline"
                            }
                            className={
                                booking.status === "APPROVED"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : undefined
                            }
                        >
                            {booking.status}
                        </Badge>

                        {isExpired && booking.status === "REQUESTED" && (
                            <p className="text-sm text-destructive">
                                This booking request has expired.
                            </p>
                        )}

                        <div className="space-y-2 text-sm">
                            <p className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Requested by{" "}
                                <strong>{booking.bookedBy.businessName}</strong>
                            </p>

                            <p className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(
                                    new Date(booking.startDate),
                                    "dd MMM yyyy"
                                )}
                                {booking.bookingType === "MULTI_DAY" &&
                                    ` – ${format(
                                        new Date(booking.endDate),
                                        "dd MMM yyyy"
                                    )}`}
                            </p>

                            {booking.startTime && booking.endTime && (
                                <p className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {booking.startTime} – {booking.endTime}
                                </p>
                            )}

                            <p className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Amount payable:
                                <strong>
                                    ₹
                                    {Number(
                                        booking.finalAmount
                                    ).toLocaleString()}
                                </strong>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    {/* Home always visible */}
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push("/vendor")}
                    >
                        Home
                    </Button>

                    {/* Show only when actionable */}
                    {isActionable && (
                        <>
                            <Button
                                className="flex-1 bg-gradient-primary"
                                disabled={decisionMutation.isPending}
                                onClick={() => handleDecision("APPROVE")}
                            >
                                Approve
                            </Button>

                            <Button
                                variant="destructive"
                                className="flex-1"
                                disabled={decisionMutation.isPending}
                                onClick={() => handleDecision("REJECT")}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
