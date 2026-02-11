"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let BillingService = class BillingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateInvoiceNumber() {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = (0, crypto_1.randomBytes)(2).toString('hex').toUpperCase();
        return `INV-${datePart}-${randomPart}`;
    }
    async create(dto, hospitalId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: dto.appointmentId },
            include: { invoice: true },
        });
        if (!appointment) {
            throw new common_1.NotFoundException(`Appointment with ID "${dto.appointmentId}" not found`);
        }
        if (appointment.invoice) {
            throw new common_1.BadRequestException('This appointment already has an invoice');
        }
        const patient = await this.prisma.patient.findFirst({
            where: { id: dto.patientId, deletedAt: null },
        });
        if (!patient) {
            throw new common_1.NotFoundException(`Patient with ID "${dto.patientId}" not found`);
        }
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
            throw new common_1.BadRequestException('Total invoice amount cannot be negative');
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
    async findAll(params) {
        const { page = 1, limit = 20, paymentStatus, hospitalId } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (hospitalId)
            where.hospitalId = hospitalId;
        if (paymentStatus)
            where.paymentStatus = paymentStatus;
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
    async findOne(id, hospitalId) {
        const where = { id };
        if (hospitalId)
            where.hospitalId = hospitalId;
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
            throw new common_1.NotFoundException(`Invoice with ID "${id}" not found`);
        }
        return invoice;
    }
    async update(id, dto, hospitalId) {
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
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map