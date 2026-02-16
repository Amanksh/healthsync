import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { AppointmentStatus } from '@prisma/client';
export declare class AppointmentService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAppointmentDto, hospitalId: string): Promise<{
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
    findAll(params: {
        page?: number;
        limit?: number;
        status?: AppointmentStatus;
        providerId?: string;
        patientId?: string;
        dateFrom?: string;
        dateTo?: string;
        hospitalId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
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
    findOne(id: string, hospitalId?: string): Promise<{
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
            pdfUrl: string | null;
            s3Key: string | null;
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
    update(id: string, dto: UpdateAppointmentDto, hospitalId?: string): Promise<{
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
    cancel(id: string, hospitalId?: string): Promise<{
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
