export type BannerPayload = {
    banners: {
        id?: number; // present = update, absent = new
        imageUrl: string;
        title?: string;
        subtitle?: string;
        ctaText?: string;
        ctaLink?: string;
        order: number;
        _delete?: boolean; // mark for deletion
    }[];
};

export interface Banner {
    id: number;
    imageUrl: string;
    title: string | null;
    subtitle: string | null;
    ctaText: string | null;
    ctaLink: string | null;
    order: number;
}
