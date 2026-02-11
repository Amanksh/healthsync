import { IsDateString, IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentDto {
    @IsDateString()
    @IsOptional()
    appointmentDate?: string;

    @IsInt()
    @Min(5)
    @Max(480)
    @IsOptional()
    durationMinutes?: number;

    @IsEnum(AppointmentStatus)
    @IsOptional()
    status?: AppointmentStatus;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
