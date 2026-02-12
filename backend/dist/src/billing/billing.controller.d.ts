import { BillingService } from './billing.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
export declare class BillingController {
    private billingService;
    constructor(billingService: BillingService);
    create(dto: CreateInvoiceDto, req: any): Promise<{
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
    findAll(page?: string, limit?: string, paymentStatus?: string, req?: any): Promise<{
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
    update(id: string, dto: UpdateInvoiceDto, req: any): Promise<{
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
