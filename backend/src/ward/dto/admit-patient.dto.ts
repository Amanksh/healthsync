import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class AdmitPatientDto {
    @IsUUID()
    patientId: string;

    @IsUUID()
    bedId: string;

    @IsOptional()
    @IsDateString()
    admissionDate?: string;

    @IsOptional()
    @IsString()
    diagnosis?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsUUID()
    attendingDoctorId?: string;
}
