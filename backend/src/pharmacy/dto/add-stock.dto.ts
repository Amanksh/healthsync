import { IsString, IsInt, Min, IsDateString } from 'class-validator';

export class AddStockDto {
    @IsString()
    batchNumber: string;

    @IsDateString()
    expiryDate: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsInt()
    @Min(0)
    costPriceCents: number;
}
