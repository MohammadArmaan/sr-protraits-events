export interface VendorProfileEditChanges {
    fullName?: string;
    businessName?: string;
    occupation?: string;
    phone?: string;
    address?: string;
    businessDescription?: string;
    profilePhoto?: string;
    businessPhotos?: string[];
}

export interface VendorProfileEditRequest {
    editId: number;
    vendorId: number;

    // Current vendor snapshot (optional but useful)
    currentProfile: {
        fullName: string;
        businessName: string;
        occupation: string;
        phone: string;
        address: string;
        businessDescription?: string;
        profilePhoto?: string;
        businessPhotos?: string[];
    };

    // Requested changes
    pendingChanges: VendorProfileEditChanges;

    requestedAt: string;
}

export type ProfileTextEditableField = Exclude<
    keyof VendorProfileEditChanges,
    "profilePhoto" | "businessPhotos"
>;

export type ProfileEditStatus =
    | "ALL"
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export interface ProfileEditRequest {
    editId: number;
    vendorId: number;

    vendorName: string;
    vendorBusinessName: string;
    vendorEmail: string;

    changes: Record<string, unknown>;

    oldProfilePhotoUrl: string | null;
    newProfilePhotoUrl: string | null;

    vendorCurrentPhoto: string | null;
    vendorBusinessPhotos: string[];

    status: ProfileEditStatus;

    createdAt: string;
    reviewedAt: string | null;

    approvedBy?: string;
}

export interface ProfileEditListResponse {
    edits: ProfileEditRequest[];
}


export interface VendorProfileEditListResponse {
    vendors: VendorProfileEditRequest[];
}
