import { submitProfileEdit } from "@/lib/vendor/editProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useEditVendorProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) =>
            submitProfileEdit(formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["vendor"],
            });
        },
    });
}
