import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { PdfService } from '../pdf/pdf.service';
import { UploadService } from '../upload/upload.service';
import { PharmacyService } from '../pharmacy/pharmacy.service';
export declare class BillingService {
    private prisma;
    private pdfService;
    private uploadService;
    private pharmacyService;
    constructor(prisma: PrismaService, pdfService: PdfService, uploadService: UploadService, pharmacyService: PharmacyService);
    private generateInvoiceNumber;
    private formatDate;
    private formatDateTime;
    private buildInvoicePdfData;
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
    findAll(params: {
        page?: number;
        limit?: number;
        paymentStatus?: string;
        hospitalId?: string;
        search?: string;
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
    update(id: string, dto: UpdateInvoiceDto, hospitalId: string): Promise<{
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
