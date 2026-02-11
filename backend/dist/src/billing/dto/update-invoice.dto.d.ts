import { PaymentStatus } from '@prisma/client';
export declare class UpdateInvoiceDto {
    paymentStatus?: PaymentStatus;
    notes?: string;
}
