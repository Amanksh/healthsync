import { PaymentStatus } from '@prisma/client';
export declare class UpdateInvoiceDto {
    paymentStatus?: PaymentStatus;
    notes?: string;
    items?: InvoiceItemDto[];
    taxRate?: number;
    discountCents?: number;
}
declare class InvoiceItemDto {
    description: string;
    category?: string;
    unitPriceCents: number;
    quantity: number;
    medicineId?: string;
}
export {};
