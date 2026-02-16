import { IsOptional, IsEnum, IsString, IsArray, ValidateNested, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '@prisma/client';

export class UpdateInvoiceDto {
    @IsEnum(PaymentStatus)
    @IsOptional()
    paymentStatus?: PaymentStatus;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    @IsOptional()
    items?: InvoiceItemDto[];

    @IsNumber()
    @IsOptional()
    taxRate?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    discountCents?: number;
}

class InvoiceItemDto {
    @IsString()
    description: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsInt()
    @Min(0)
    unitPriceCents: number;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsString()
    @IsOptional()
    medicineId?: string;
}
