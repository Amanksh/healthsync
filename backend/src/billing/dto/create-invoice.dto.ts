import {
    IsUUID,
    IsOptional,
    IsString,
    IsArray,
    ValidateNested,
    IsEnum,
    IsInt,
    Min,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceItemCategory } from '@prisma/client';

class CreateInvoiceItemDto {
    @IsString()
    description: string;

    @IsEnum(InvoiceItemCategory)
    @IsOptional()
    category?: InvoiceItemCategory;

    @IsInt()
    @Min(0)
    unitPriceCents: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    quantity?: number;
}

export class CreateInvoiceDto {
    @IsUUID()
    appointmentId: string;

    @IsUUID()
    patientId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items: CreateInvoiceItemDto[];

    @IsNumber()
    @Min(0)
    @IsOptional()
    taxRate?: number; // e.g. 0.18 for 18%

    @IsInt()
    @Min(0)
    @IsOptional()
    discountCents?: number;

    @IsString()
    @IsOptional()
    notes?: string;
}
