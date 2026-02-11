import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate a unique invoice number.
     * Format: INV-YYYYMMDD-XXXX (e.g., INV-20260211-B4E1)
     */
    private generateInvoiceNumber(): string {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = randomBytes(2).toString('hex').toUpperCase();
        return `INV-${datePart}-${randomPart}`;
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

        return this.prisma.invoice.create({
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
                    select: { id: true, firstName: true, lastName: true, mrn: true },
                },
                appointment: {
                    select: { id: true, appointmentDate: true, status: true },
                },
            },
        });
    }

    async findAll(params: { page?: number; limit?: number; paymentStatus?: string; hospitalId?: string }) {
        const { page = 1, limit = 20, paymentStatus, hospitalId } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (hospitalId) where.hospitalId = hospitalId;
        if (paymentStatus) where.paymentStatus = paymentStatus;

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

    async update(id: string, dto: UpdateInvoiceDto, hospitalId?: string) {
        await this.findOne(id, hospitalId);

        return this.prisma.invoice.update({
            where: { id },
            data: dto,
            include: {
                items: true,
                patient: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
}
