"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useDownloadBookingInvoice() {
    return useMutation({
        mutationFn: async (uuid: string) => {
            const response = await axios.get(
                `/api/vendors/bookings/${uuid}/invoice`,
                {
                    responseType: "blob", // 🔑 important for PDF
                }
            );

            // Create downloadable file
            const blob = new Blob([response.data], {
                type: "application/pdf",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `Invoice-${uuid}.pdf`;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);
        },
    });
}
