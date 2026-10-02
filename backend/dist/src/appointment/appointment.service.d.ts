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
        patientId: string;
        providerId: string;
        durationMinutes: number;
        reason: string | null;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
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
        patientId: string;
        providerId: string;
        durationMinutes: number;
        reason: string | null;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
    }>;
    cancel(id: string, hospitalId?: string): Promise<{
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
