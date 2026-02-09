export interface VendorProfileEditChanges {
    fullName?: string;
    businessName?: string;
    occupation?: string;
    phone?: string;
    address?: string;
    businessDescription?: string;
    yearsOfExperience?: number;
    successfulEventsCompleted?: number;
    gstNumber?: string | null;
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
        yearsOfExperience?: number;
        successfulEventsCompleted?: number;
        gstNumber?: string | null;
    };

    // Requested changes
    pendingChanges: VendorProfileEditChanges;

    requestedAt: string;
}

export type ProfileTextEditableField = Exclude<
    keyof VendorProfileEditChanges,
    "profilePhoto" | "businessPhotos"
>;

export type ProfileEditStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export interface ProfileEditRequest {
    editId: number;
    vendorId: number;

    vendorName: string;
    vendorPhone: string;
    vendorOccupation: string;
    vendorDescription: string;
    vendorBusinessName: string;
    vendorEmail: string;
    vendorGstNumber: string | null;
    vendorAddress: string;
    vendorYearsOfExperience: number;
    vendorSuccessfulEventsCompleted: number;

    profileChanges: Record<string, unknown>;

    catalogChanges:
        | {
              catalogId?: number;
              action: "ADD" | "UPDATE" | "DELETE";
              payload: {
                  title?: string;
                  description?: string;
                  addedImages?: string[];
                  removedImageIds?: number[];
              };
          }[]
        | null;

    catalogs: {
        id: number;
        title: string;
        description: string | null;
        images: {
            id: number;
            imageUrl: string;
        }[];
    }[];

    oldProfilePhotoUrl: string | null;
    newProfilePhotoUrl: string | null;

    vendorCurrentPhoto: string | null;

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
