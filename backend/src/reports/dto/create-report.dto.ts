import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportType } from '@prisma/client';

export class CreateReportDto {
    @IsUUID()
    patientId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsEnum(ReportType)
    type: ReportType;

    @IsDateString()
    @IsOptional()
    reportDate?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
