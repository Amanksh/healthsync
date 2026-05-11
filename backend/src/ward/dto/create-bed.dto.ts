import { IsString, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { BedStatus } from '@prisma/client';

export class SingleBedDto {
    @IsString()
    bedNumber: string;

    @IsOptional()
    @IsEnum(BedStatus)
    status?: BedStatus;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateBedsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SingleBedDto)
    beds: SingleBedDto[];
}
