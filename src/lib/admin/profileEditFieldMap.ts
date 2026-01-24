import {
    ProfileTextEditableField,
    VendorProfileEditChanges,
    VendorProfileEditRequest,
} from "@/types/admin/profile-edit";

export const PROFILE_EDIT_FIELD_MAP: Record<
    ProfileTextEditableField,
    (
        profile: VendorProfileEditRequest["currentProfile"]
    ) => unknown
> = {
    fullName: (p) => p.fullName,
    businessName: (p) => p.businessName,
    occupation: (p) => p.occupation,
    phone: (p) => p.phone,
    address: (p) => p.address,
    businessDescription: (p) => p.businessDescription,
};
