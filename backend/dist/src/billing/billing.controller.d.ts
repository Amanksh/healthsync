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
            description: string;
            category: import("@prisma/client").$Enums.InvoiceItemCategory;
            unitPriceCents: number;
            quantity: number;
            medicineId: string | null;
            totalCents: number;
            invoiceId: string;
        }[];
    } & {
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
    }>;
    findAll(page?: string, limit?: string, paymentStatus?: string, search?: string, req?: any): Promise<{
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
                description: string;
                category: import("@prisma/client").$Enums.InvoiceItemCategory;
                unitPriceCents: number;
                quantity: number;
                medicineId: string | null;
                totalCents: number;
                invoiceId: string;
            }[];
        } & {
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
            patientId: string;
            providerId: string;
            durationMinutes: number;
            reason: string | null;
            notes: string | null;
            status: import("@prisma/client").$Enums.AppointmentStatus;
        };
        items: {
            id: string;
            description: string;
            category: import("@prisma/client").$Enums.InvoiceItemCategory;
            unitPriceCents: number;
            quantity: number;
            medicineId: string | null;
            totalCents: number;
            invoiceId: string;
        }[];
    } & {
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
    }>;
    update(id: string, dto: UpdateInvoiceDto, req: any): Promise<{
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
            description: string;
            category: import("@prisma/client").$Enums.InvoiceItemCategory;
            unitPriceCents: number;
            quantity: number;
            medicineId: string | null;
            totalCents: number;
            invoiceId: string;
        }[];
    } & {
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
    }>;
}
