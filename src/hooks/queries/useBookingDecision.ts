import { useMutation } from "@tanstack/react-query";

export const useBookingDecision = (uuid: string) => {
    return useMutation<
        { success: true; status: string },
        Error,
        "APPROVE" | "REJECT"
    >({
        mutationFn: async (decision) => {
            const res = await fetch(`/api/vendors/bookings/${uuid}/decision`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision }),
            });

            if (!res.ok) throw new Error("Decision failed");
            return await res.json();
        },
    });
};
