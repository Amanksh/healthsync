import { InvoiceItemCategory } from '@prisma/client';
declare class CreateInvoiceItemDto {
    description: string;
    category?: InvoiceItemCategory;
    unitPriceCents: number;
    quantity?: number;
}
export declare class CreateInvoiceDto {
    appointmentId: string;
    patientId: string;
    items: CreateInvoiceItemDto[];
    taxRate?: number;
    discountCents?: number;
    notes?: string;
}
export {};
