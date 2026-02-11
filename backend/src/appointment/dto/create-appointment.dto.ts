import {
    IsUUID,
    IsDateString,
    IsOptional,
    IsString,
    IsInt,
    Min,
    Max,
} from 'class-validator';

export class CreateAppointmentDto {
    @IsUUID()
    patientId: string;

    @IsUUID()
    providerId: string;

    @IsDateString()
    appointmentDate: string;

    @IsInt()
    @Min(5)
    @Max(480)
    @IsOptional()
    durationMinutes?: number;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
