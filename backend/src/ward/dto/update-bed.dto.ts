import { IsString, IsOptional, IsEnum } from 'class-validator';
import { BedStatus } from '@prisma/client';

export class UpdateBedDto {
    @IsOptional()
    @IsString()
    bedNumber?: string;

    @IsOptional()
    @IsEnum(BedStatus)
    status?: BedStatus;

    @IsOptional()
    @IsString()
    notes?: string;
}
