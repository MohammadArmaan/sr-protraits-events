"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Eye, MoreHorizontal, X } from "lucide-react";

interface VendorActionsMenuProps {
    onAccept: () => void;
    onReject: () => void;
    onViewDetails: () => void;
    disabled?: boolean;
    status?: string;
}

export function VendorActionsMenu({
    onAccept,
    onReject,
    onViewDetails,
    disabled = false,
    status,
}: VendorActionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={disabled}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onViewDetails} className="flex gap-2">
                    <Eye className="h-4 w-4" /> 
                    View Details
                </DropdownMenuItem>

                {status === "PENDING_APPROVAL" || status === "BUSINESS_PHOTOS_UPLOADED" && (
                    <>
                        <DropdownMenuItem
                            onClick={onAccept}
                            className="text-green-600 focus:text-green-600 flex gap-2"
                        >
                            <Check className="h-4 w-4" /> Approve
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={onReject}
                            className="text-destructive focus:text-destructive flex gap-2"
                        >
                            <X className="h-4 w-4" /> Reject
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
