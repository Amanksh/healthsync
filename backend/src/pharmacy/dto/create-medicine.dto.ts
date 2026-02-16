import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';

export class CreateMedicineDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    genericName?: string;

    @IsString()
    @IsOptional()
    code?: string; // SKU/Barcode

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    manufacturer?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    minStock?: number;

    @IsInt()
    @Min(0)
    unitPriceCents: number;
}
