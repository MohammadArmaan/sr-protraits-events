export interface InvoiceData {
    invoiceNumber: string;
    issuedAt: Date;

    productTitle: string;

    basePrice: number;
    discountAmount: number;
    finalAmount: number;

    advanceAmount: number;
    remainingAmount: number;

    provider: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
    };

    requester: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
    };
}
