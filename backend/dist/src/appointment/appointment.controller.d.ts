import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { AppointmentStatus } from '@prisma/client';
export declare class AppointmentController {
    private appointmentService;
    constructor(appointmentService: AppointmentService);
    create(dto: CreateAppointmentDto, req: any): Promise<{
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            mrn: string;
        };
        provider: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        appointmentDate: Date;
        durationMinutes: number;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        reason: string | null;
        notes: string | null;
        patientId: string;
        providerId: string;
    }>;
    findAll(page?: string, limit?: string, status?: AppointmentStatus, providerId?: string, patientId?: string, dateFrom?: string, dateTo?: string, req?: any): Promise<{
        data: ({
            patient: {
                id: string;
                firstName: string;
                lastName: string;
                mrn: string;
            };
            provider: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hospitalId: string;
            appointmentDate: Date;
            durationMinutes: number;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            reason: string | null;
            notes: string | null;
            patientId: string;
            providerId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, req: any): Promise<{
        patient: {
            id: string;
            address: string | null;
            city: string | null;
            state: string | null;
            zipCode: string | null;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            hospitalId: string;
            mrn: string;
            dateOfBirth: Date;
            gender: import("@prisma/client").$Enums.Gender;
            emergencyContact: import("@prisma/client/runtime/library").JsonValue | null;
            bloodGroup: string | null;
            allergies: string | null;
            deletedAt: Date | null;
        };
        provider: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        invoice: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hospitalId: string;
            notes: string | null;
            patientId: string;
            invoiceNumber: string;
            subtotalCents: number;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            taxAmountCents: number;
            discountCents: number;
            totalCents: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            appointmentId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        appointmentDate: Date;
        durationMinutes: number;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        reason: string | null;
        notes: string | null;
        patientId: string;
        providerId: string;
    }>;
    update(id: string, dto: UpdateAppointmentDto, req: any): Promise<{
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            mrn: string;
        };
        provider: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        appointmentDate: Date;
        durationMinutes: number;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        reason: string | null;
        notes: string | null;
        patientId: string;
        providerId: string;
    }>;
    cancel(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        appointmentDate: Date;
        durationMinutes: number;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        reason: string | null;
        notes: string | null;
        patientId: string;
        providerId: string;
    }>;
}
