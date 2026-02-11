import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class UpdateInvoiceDto {
    @IsEnum(PaymentStatus)
    @IsOptional()
    paymentStatus?: PaymentStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}
