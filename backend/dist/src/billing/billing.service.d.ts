import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
export declare class BillingService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateInvoiceNumber;
    create(dto: CreateInvoiceDto, hospitalId: string): Promise<{
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            mrn: string;
        };
        appointment: {
            id: string;
            appointmentDate: Date;
            status: import("@prisma/client").$Enums.AppointmentStatus;
        };
        items: {
            id: string;
            totalCents: number;
            description: string;
            category: import("@prisma/client").$Enums.InvoiceItemCategory;
            unitPriceCents: number;
            quantity: number;
            invoiceId: string;
        }[];
    } & {
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
    }>;
    findAll(params: {
        page?: number;
        limit?: number;
        paymentStatus?: string;
        hospitalId?: string;
    }): Promise<{
        data: ({
            patient: {
                id: string;
                firstName: string;
                lastName: string;
                mrn: string;
            };
            appointment: {
                id: string;
                appointmentDate: Date;
            };
            items: {
                id: string;
                totalCents: number;
                description: string;
                category: import("@prisma/client").$Enums.InvoiceItemCategory;
                unitPriceCents: number;
                quantity: number;
                invoiceId: string;
            }[];
        } & {
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
        appointment: {
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
        };
        items: {
            id: string;
            totalCents: number;
            description: string;
            category: import("@prisma/client").$Enums.InvoiceItemCategory;
            unitPriceCents: number;
            quantity: number;
            invoiceId: string;
        }[];
    } & {
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
    }>;
    update(id: string, dto: UpdateInvoiceDto, hospitalId?: string): Promise<{
        patient: {
            id: string;
            firstName: string;
            lastName: string;
        };
        items: {
            id: string;
            totalCents: number;
            description: string;
            category: import("@prisma/client").$Enums.InvoiceItemCategory;
            unitPriceCents: number;
            quantity: number;
            invoiceId: string;
        }[];
    } & {
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
    }>;
}
