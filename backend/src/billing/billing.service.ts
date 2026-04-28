import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { randomBytes } from 'crypto';

import { PdfService } from '../pdf/pdf.service';
import { UploadService } from '../upload/upload.service';
import { PharmacyService } from '../pharmacy/pharmacy.service';

type InvoicePdfSource = {
    invoiceNumber: string;
    createdAt: Date;
    paymentStatus: string;
    subtotalCents: number;
    taxRate: unknown;
    taxAmountCents: number;
    discountCents: number;
    totalCents: number;
    notes?: string | null;
    hospital: {
        name: string;
        address?: string | null;
        city?: string | null;
        state?: string | null;
        zipCode?: string | null;
        phone?: string | null;
    };
    patient: {
        firstName: string;
        lastName: string;
        mrn: string;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        state?: string | null;
        zipCode?: string | null;
    };
    appointment?: {
        appointmentDate: Date;
        status?: string;
        provider?: {
            firstName: string;
            lastName: string;
        };
    } | null;
    items: Array<{
        description: string;
        category: string;
        unitPriceCents: number;
        quantity: number;
        totalCents: number;
    }>;
};

@Injectable()
export class BillingService {
    constructor(
        private prisma: PrismaService,
        private pdfService: PdfService,
        private uploadService: UploadService,
        private pharmacyService: PharmacyService,
    ) { }

    /**
     * Generate a unique invoice number.
     * Format: INV-YYYYMMDD-XXXX (e.g., INV-20260211-B4E1)
     */
    private generateInvoiceNumber(): string {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = randomBytes(2).toString('hex').toUpperCase();
        return `INV-${datePart}-${randomPart}`;
    }

    private formatDate(date?: Date | null): string {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    private formatDateTime(date?: Date | null): string {
        if (!date) return 'N/A';
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    private buildInvoicePdfData(invoice: InvoicePdfSource) {
        return {
            invoiceNumber: invoice.invoiceNumber,
            date: this.formatDate(invoice.createdAt),
            paymentStatus: invoice.paymentStatus,
            hospitalName: invoice.hospital.name,
            hospitalAddress: invoice.hospital.address,
            hospitalCity: invoice.hospital.city,
            hospitalState: invoice.hospital.state,
            hospitalZip: invoice.hospital.zipCode,
            hospitalPhone: invoice.hospital.phone,
            patientName: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
            patientMrn: invoice.patient.mrn,
            patientPhone: invoice.patient.phone,
            patientAddress: invoice.patient.address,
            patientCity: invoice.patient.city,
            patientState: invoice.patient.state,
            patientZip: invoice.patient.zipCode,
            appointmentDate: this.formatDateTime(invoice.appointment?.appointmentDate),
            appointmentStatus: invoice.appointment?.status,
            providerName: invoice.appointment?.provider
                ? `Dr. ${invoice.appointment.provider.firstName} ${invoice.appointment.provider.lastName}`
                : undefined,
            items: invoice.items.map(item => ({
                description: item.description,
                category: item.category,
                unitPrice: (item.unitPriceCents / 100).toFixed(2),
                quantity: item.quantity,
                total: (item.totalCents / 100).toFixed(2),
            })),
            subtotal: (invoice.subtotalCents / 100).toFixed(2),
            taxRate: (Number(invoice.taxRate) * 100).toFixed(2),
            taxAmount: (invoice.taxAmountCents / 100).toFixed(2),
            discount: (invoice.discountCents / 100).toFixed(2),
            totalAmount: (invoice.totalCents / 100).toFixed(2),
            notes: invoice.notes,
        };
    }

    async create(dto: CreateInvoiceDto, hospitalId: string) {
        // Validate appointment exists
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: dto.appointmentId },
            include: { invoice: true },
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID "${dto.appointmentId}" not found`);
        }

        if (appointment.invoice) {
            throw new BadRequestException('This appointment already has an invoice');
        }

        // Validate patient exists
        const patient = await this.prisma.patient.findFirst({
            where: { id: dto.patientId, deletedAt: null },
        });

        if (!patient) {
            throw new NotFoundException(`Patient with ID "${dto.patientId}" not found`);
        }

        // Calculate amounts (all in cents — no floating point)
        const items = dto.items.map((item) => {
            const quantity = item.quantity || 1;
            const totalCents = item.unitPriceCents * quantity;
            return {
                description: item.description,
                category: item.category || 'OTHER',
                unitPriceCents: item.unitPriceCents,
                quantity,
                totalCents,
            };
        });

        const subtotalCents = items.reduce((sum, item) => sum + item.totalCents, 0);
        const taxRate = dto.taxRate || 0;
        const taxAmountCents = Math.round(subtotalCents * taxRate);
        const discountCents = dto.discountCents || 0;
        const totalCents = subtotalCents + taxAmountCents - discountCents;

        if (totalCents < 0) {
            throw new BadRequestException('Total invoice amount cannot be negative');
        }

        const invoiceNumber = this.generateInvoiceNumber();

        const invoice = await this.prisma.invoice.create({
            data: {
                invoiceNumber,
                appointmentId: dto.appointmentId,
                patientId: dto.patientId,
                subtotalCents,
                taxRate,
                taxAmountCents,
                discountCents,
                totalCents,
                notes: dto.notes,
                hospitalId,
                items: {
                    create: items,
                },
            },
            include: {
                items: true,
                patient: {
                    select: { id: true, firstName: true, lastName: true, mrn: true, phone: true, address: true, city: true, state: true, zipCode: true },
                },
                appointment: {
                    include: {
                        provider: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                },
                hospital: true,
            },
        });

        // Generate PDF
        try {
            const pdfData = this.buildInvoicePdfData(invoice);
            const pdfBuffer = await this.pdfService.generateInvoicePdf(pdfData);
            const s3Key = `invoices/${hospitalId}/${invoice.id}.pdf`;
            const pdfUrl = await this.uploadService.uploadFile(s3Key, pdfBuffer, 'application/pdf');

            // Update invoice with PDF URL
            return this.prisma.invoice.update({
                where: { id: invoice.id },
                data: { pdfUrl, s3Key },
                include: {
                    items: true,
                    patient: {
                        select: { id: true, firstName: true, lastName: true, mrn: true },
                    },
                    appointment: {
                        select: { id: true, appointmentDate: true, status: true },
                    },
                },
            });

        } catch (error) {
            console.error('Error generating/uploading PDF:', error);
            // Return invoice even if PDF fails (can be regenerated later)
            return invoice;
        }
    }

    async findAll(params: { page?: number; limit?: number; paymentStatus?: string; hospitalId?: string; search?: string }) {
        const { page = 1, limit = 20, paymentStatus, hospitalId, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (hospitalId) where.hospitalId = hospitalId;
        if (paymentStatus) where.paymentStatus = paymentStatus;

        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [invoices, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true,
                    patient: {
                        select: { id: true, firstName: true, lastName: true, mrn: true },
                    },
                    appointment: {
                        select: { id: true, appointmentDate: true },
                    },
                },
            }),
            this.prisma.invoice.count({ where }),
        ]);

        return {
            data: invoices,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, hospitalId?: string) {
        const where: any = { id };
        if (hospitalId) where.hospitalId = hospitalId;

        const invoice = await this.prisma.invoice.findFirst({
            where,
            include: {
                items: true,
                patient: true,
                appointment: {
                    include: {
                        provider: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                },
            },
        });

        if (!invoice) {
            throw new NotFoundException(`Invoice with ID "${id}" not found`);
        }

        return invoice;
    }

    async update(id: string, dto: UpdateInvoiceDto, hospitalId: string) {
        const existingInvoice = await this.findOne(id, hospitalId);

        // Calculate totals for NEW items
        let additionalItems = [];
        let additionalSubtotal = 0;

        if (dto.items && dto.items.length > 0) {
            for (const item of dto.items) {
                // If it's a medicine, deduct stock
                if (item.medicineId) {
                    await this.pharmacyService.deductStock(item.medicineId, item.quantity, hospitalId);
                }

                const totalCents = item.unitPriceCents * item.quantity;
                additionalItems.push({
                    description: item.description,
                    category: (item.category as any) || 'MEDICINE',
                    unitPriceCents: item.unitPriceCents,
                    quantity: item.quantity,
                    totalCents,
                    medicineId: item.medicineId, // Optional link
                });
                additionalSubtotal += totalCents;
            }
        }

        // Recalculate invoice totals
        const newSubtotal = existingInvoice.subtotalCents + additionalSubtotal;
        const taxRate = dto.taxRate !== undefined ? dto.taxRate : Number(existingInvoice.taxRate);
        const taxAmountCents = Math.round(newSubtotal * taxRate);
        const discountCents = dto.discountCents !== undefined ? dto.discountCents : existingInvoice.discountCents;
        const totalCents = newSubtotal + taxAmountCents - discountCents;

        const result = await this.prisma.invoice.update({
            where: { id },
            data: {
                paymentStatus: dto.paymentStatus,
                notes: dto.notes,
                subtotalCents: newSubtotal,
                taxRate,
                taxAmountCents,
                totalCents,
                discountCents,
                items: {
                    create: additionalItems,
                },
            },
            include: {
                items: true,
                patient: {
                    select: { id: true, firstName: true, lastName: true, mrn: true, phone: true, address: true, city: true, state: true, zipCode: true },
                },
                appointment: {
                    include: {
                        provider: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                },
                hospital: true,
            },
        });

        // Regenerate PDF
        try {
            const pdfData = this.buildInvoicePdfData(result);
            const pdfBuffer = await this.pdfService.generateInvoicePdf(pdfData);
            const s3Key = `invoices/${hospitalId}/${result.id}.pdf`;
            const pdfUrl = await this.uploadService.uploadFile(s3Key, pdfBuffer, 'application/pdf');

            return this.prisma.invoice.update({
                where: { id: result.id },
                data: { pdfUrl, s3Key },
                include: {
                    items: true,
                    patient: {
                        select: { id: true, firstName: true, lastName: true, mrn: true },
                    },
                    appointment: {
                        select: { id: true, appointmentDate: true, status: true },
                    },
                },
            });
        } catch (error) {
            console.error('Error regenerating/uploading PDF:', error);
            return result;
        }
    }
}
