import { IsString, IsOptional, IsDateString } from 'class-validator';

export class DischargePatientDto {
    @IsOptional()
    @IsDateString()
    dischargeDate?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
