import { AppointmentStatus } from '@prisma/client';
export declare class UpdateAppointmentDto {
    appointmentDate?: string;
    durationMinutes?: number;
    status?: AppointmentStatus;
    reason?: string;
    notes?: string;
}
