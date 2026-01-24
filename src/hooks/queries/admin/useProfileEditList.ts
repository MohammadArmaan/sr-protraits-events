import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { ProfileEditRequest } from "@/types/admin/profile-edit";

interface RawResponse {
    success: boolean;
    edits: ProfileEditRequest[];
}

export function useProfileEditList() {
    return useQuery({
        queryKey: ["admin", "profile-edits", "list"],
        queryFn: async () => {
            try {
                const res = await axios.get<RawResponse>(
                    "/api/admin/profile-edits/list",
                    { withCredentials: true }
                );

                return {
                    edits: res.data.edits,
                };
            } catch (err) {
                throw new Error(getApiErrorMessage(err));
            }
        },
    });
}
