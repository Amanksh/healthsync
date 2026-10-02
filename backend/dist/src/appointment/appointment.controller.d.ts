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
        patientId: string;
        providerId: string;
        durationMinutes: number;
        reason: string | null;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
    }>;
    findAll(page?: string, limit?: string, status?: AppointmentStatus, providerId?: string, patientId?: string, dateFrom?: string, dateTo?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', req?: any): Promise<{
        data: ({
            patient: {
                id: string;
                firstName: string;
                lastName: string;
                phone: string;
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
            patientId: string;
            providerId: string;
            durationMinutes: number;
            reason: string | null;
            notes: string | null;
            status: import("@prisma/client").$Enums.AppointmentStatus;
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
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            hospitalId: string;
            address: string | null;
            city: string | null;
            state: string | null;
            zipCode: string | null;
            dateOfBirth: Date;
            gender: import("@prisma/client").$Enums.Gender;
            emergencyContact: import("@prisma/client/runtime/library").JsonValue | null;
            bloodGroup: string | null;
            allergies: string | null;
            mrn: string;
            deletedAt: Date | null;
        };
        invoice: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hospitalId: string;
            patientId: string;
            notes: string | null;
            appointmentId: string;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            discountCents: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            invoiceNumber: string;
            subtotalCents: number;
            taxAmountCents: number;
            totalCents: number;
            pdfUrl: string | null;
            s3Key: string | null;
        } | null;
        provider: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        appointmentDate: Date;
        patientId: string;
        providerId: string;
        durationMinutes: number;
        reason: string | null;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
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
        patientId: string;
        providerId: string;
        durationMinutes: number;
        reason: string | null;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
    }>;
    cancel(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        appointmentDate: Date;
        patientId: string;
        providerId: string;
        durationMinutes: number;
        reason: string | null;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
    }>;
}
