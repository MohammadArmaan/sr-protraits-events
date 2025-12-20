"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVendorBankDetails } from "@/hooks/queries/useVendorBankDetails";
import { useAddBankDetails } from "@/hooks/queries/useAddBankDetails";
import { useEditBankDetails } from "@/hooks/queries/useEditBankDetails";
import { VendorBankDetailsSkeleton } from "@/components/skeleton/VendorBankDetailsSkeleton";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { toast } from "sonner";

export default function VendorBankDetails() {
    const { data, isLoading } = useVendorBankDetails();
    const addMutation = useAddBankDetails();
    const editMutation = useEditBankDetails();

    const bank = data?.bankDetails;

    const [isEditing, setIsEditing] = useState(false);
    const [showEditWarning, setShowEditWarning] = useState(false);

    const [form, setForm] = useState({
        accountHolderName: "",
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        confirmed: false,
    });

    const isSubmitting =
        addMutation.isPending || editMutation.isPending;

    /* -----------------------------------------
       Prefill form when bank details exist
       (Account number intentionally NOT prefilled)
    ----------------------------------------- */
    useEffect(() => {
        if (!bank) return;

        setForm({
            accountHolderName: bank.accountHolderName,
            accountNumber: "",
            confirmAccountNumber: "",
            ifscCode: bank.ifscCode,
            confirmed: false,
        });
    }, [bank]);

    function handleSubmit() {
        if (!form.confirmed) {
            toast.error("Please confirm bank details before submitting");
            return;
        }

        const action = bank ? editMutation : addMutation;

        action.mutate(form, {
            onSuccess: () => {
                toast.success(
                    bank
                        ? "Bank details updated. Awaiting admin approval."
                        : "Bank details saved. You are payout-ready."
                );

                setIsEditing(false);
                setShowEditWarning(false);

                setForm({
                    accountHolderName: "",
                    accountNumber: "",
                    confirmAccountNumber: "",
                    ifscCode: "",
                    confirmed: false,
                });
            },
            onError: (err) => {
                toast.error(getApiErrorMessage(err));
            },
        });
    }

    if (isLoading) {
        return <VendorBankDetailsSkeleton />;
    }

    return (
        <Card className="rounded-2xl mt-10">
            <CardContent className="p-8 space-y-6">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-2xl font-semibold">
                        Bank & Payout Details
                    </h2>

                    {bank && (
                        <>
                            {bank.isPayoutReady ? (
                                <Badge className="bg-green-500 text-white">
                                    Payout Ready
                                </Badge>
                            ) : bank.isEdited ? (
                                <Badge className="bg-yellow-500 text-white">
                                    Awaiting Admin Approval
                                </Badge>
                            ) : (
                                <Badge variant="destructive">
                                    Payout Paused
                                </Badge>
                            )}
                        </>
                    )}
                </div>

                {/* EXISTING DETAILS (READ-ONLY VIEW) */}
                {bank && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border rounded-lg p-4">
                        <p>
                            <span className="font-medium">
                                Account Holder:
                            </span>{" "}
                            {bank.accountHolderName}
                        </p>
                        <p>
                            <span className="font-medium">
                                Account Number:
                            </span>{" "}
                            {bank.accountNumber}
                        </p>
                        <p>
                            <span className="font-medium">
                                IFSC Code:
                            </span>{" "}
                            {bank.ifscCode}
                        </p>
                    </div>
                )}

                {/* WARNING: UNDER REVIEW */}
                {bank && bank.isEdited && (
                    <Alert>
                        <AlertDescription>
                            Your updated bank details are under review.
                            Payouts are temporarily paused until admin
                            approval.
                        </AlertDescription>
                    </Alert>
                )}

                {/* WARNING BEFORE EDIT */}
                {showEditWarning && (
                    <Alert variant="destructive">
                        <AlertDescription className="space-y-2">
                            <p className="font-medium">
                                Editing bank details will temporarily pause
                                payouts.
                            </p>
                            <p className="text-sm">
                                Any changes require admin approval before
                                payouts can resume. Please ensure the details
                                are accurate.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setShowEditWarning(false);
                                    }}
                                >
                                    Proceed Anyway
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        setShowEditWarning(false)
                                    }
                                >
                                    Cancel
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* FORM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        placeholder="Account Holder Name"
                        disabled={!!bank && !isEditing}
                        value={form.accountHolderName}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                accountHolderName: e.target.value,
                            }))
                        }
                    />

                    <Input
                        placeholder="IFSC Code"
                        disabled={!!bank && !isEditing}
                        value={form.ifscCode}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                ifscCode: e.target.value.toUpperCase(),
                            }))
                        }
                    />

                    <Input
                        placeholder="Account Number"
                        disabled={!!bank && !isEditing}
                        value={form.accountNumber}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                accountNumber: e.target.value,
                            }))
                        }
                    />

                    <Input
                        placeholder="Confirm Account Number"
                        disabled={!!bank && !isEditing}
                        value={form.confirmAccountNumber}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                confirmAccountNumber: e.target.value,
                            }))
                        }
                    />
                </div>

                {/* CONFIRMATION */}
                {(!bank || isEditing) && (
                    <div className="flex items-start gap-2 text-sm">
                        <Checkbox
                            checked={form.confirmed}
                            onCheckedChange={(checked) =>
                                setForm((p) => ({
                                    ...p,
                                    confirmed: Boolean(checked),
                                }))
                            }
                        />
                        <p className="leading-snug">
                            I confirm that the above bank details are correct
                            and agree to receive payouts to this account.
                        </p>
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex gap-3">
                    {bank && !isEditing && (
                        <Button
                            variant="outline"
                            onClick={() => setShowEditWarning(true)}
                        >
                            Edit Bank Details
                        </Button>
                    )}

                    {(!bank || isEditing) && (
                        <Button
                            className="rounded-pill bg-gradient-primary"
                            disabled={
                                isSubmitting || !form.confirmed
                            }
                            onClick={handleSubmit}
                        >
                            {isSubmitting
                                ? "Submitting..."
                                : bank
                                ? "Submit Changes for Approval"
                                : "Save Bank Details"}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
