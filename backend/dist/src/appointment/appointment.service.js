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
exports.AppointmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AppointmentService = class AppointmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, hospitalId) {
        const patient = await this.prisma.patient.findFirst({
            where: { id: dto.patientId, deletedAt: null },
        });
        if (!patient) {
            throw new common_1.NotFoundException(`Patient with ID "${dto.patientId}" not found`);
        }
        const provider = await this.prisma.user.findFirst({
            where: { id: dto.providerId, role: 'DOCTOR', isActive: true },
        });
        if (!provider) {
            throw new common_1.NotFoundException(`Doctor with ID "${dto.providerId}" not found`);
        }
        const appointmentDate = new Date(dto.appointmentDate);
        const durationMinutes = dto.durationMinutes || 30;
        const endTime = new Date(appointmentDate.getTime() + durationMinutes * 60 * 1000);
        const overlapping = await this.prisma.appointment.findFirst({
            where: {
                providerId: dto.providerId,
                status: client_1.AppointmentStatus.SCHEDULED,
                appointmentDate: {
                    lt: endTime,
                },
                AND: {
                    appointmentDate: {
                        gte: new Date(appointmentDate.getTime() - durationMinutes * 60 * 1000),
                    },
                },
            },
        });
        if (overlapping) {
            throw new common_1.BadRequestException('This time slot conflicts with an existing appointment for this provider');
        }
        return this.prisma.appointment.create({
            data: {
                patientId: dto.patientId,
                providerId: dto.providerId,
                appointmentDate,
                durationMinutes,
                reason: dto.reason,
                notes: dto.notes,
                hospitalId,
            },
            include: {
                patient: {
                    select: { id: true, firstName: true, lastName: true, mrn: true },
                },
                provider: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async findAll(params) {
        const { page = 1, limit = 20, status, providerId, patientId, dateFrom, dateTo, hospitalId } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (hospitalId)
            where.hospitalId = hospitalId;
        if (status)
            where.status = status;
        if (providerId)
            where.providerId = providerId;
        if (patientId)
            where.patientId = patientId;
        if (dateFrom || dateTo) {
            where.appointmentDate = {};
            if (dateFrom)
                where.appointmentDate.gte = new Date(dateFrom);
            if (dateTo)
                where.appointmentDate.lte = new Date(dateTo);
        }
        const [appointments, total] = await Promise.all([
            this.prisma.appointment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { appointmentDate: 'desc' },
                include: {
                    patient: {
                        select: { id: true, firstName: true, lastName: true, mrn: true },
                    },
                    provider: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            }),
            this.prisma.appointment.count({ where }),
        ]);
        return {
            data: appointments,
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
        const appointment = await this.prisma.appointment.findFirst({
            where,
            include: {
                patient: true,
                provider: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                invoice: true,
            },
        });
        if (!appointment) {
            throw new common_1.NotFoundException(`Appointment with ID "${id}" not found`);
        }
        return appointment;
    }
    async update(id, dto, hospitalId) {
        const appointment = await this.findOne(id, hospitalId);
        if (appointment.status === client_1.AppointmentStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot update a cancelled appointment');
        }
        const updateData = { ...dto };
        if (dto.appointmentDate) {
            updateData.appointmentDate = new Date(dto.appointmentDate);
        }
        return this.prisma.appointment.update({
            where: { id },
            data: updateData,
            include: {
                patient: {
                    select: { id: true, firstName: true, lastName: true, mrn: true },
                },
                provider: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async cancel(id, hospitalId) {
        const appointment = await this.findOne(id, hospitalId);
        if (appointment.status === client_1.AppointmentStatus.CANCELLED) {
            throw new common_1.BadRequestException('Appointment is already cancelled');
        }
        if (appointment.status === client_1.AppointmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel a completed appointment');
        }
        return this.prisma.appointment.update({
            where: { id },
            data: { status: client_1.AppointmentStatus.CANCELLED },
        });
    }
};
exports.AppointmentService = AppointmentService;
exports.AppointmentService = AppointmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppointmentService);
//# sourceMappingURL=appointment.service.js.map