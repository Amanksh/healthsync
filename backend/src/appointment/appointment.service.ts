import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateAppointmentDto, hospitalId: string) {
        // Validate patient exists and is not soft-deleted
        const patient = await this.prisma.patient.findFirst({
            where: { id: dto.patientId, deletedAt: null },
        });
        if (!patient) {
            throw new NotFoundException(`Patient with ID "${dto.patientId}" not found`);
        }

        // Validate provider exists and is a DOCTOR
        const provider = await this.prisma.user.findFirst({
            where: { id: dto.providerId, role: 'DOCTOR', isActive: true },
        });
        if (!provider) {
            throw new NotFoundException(`Doctor with ID "${dto.providerId}" not found`);
        }

        // Check for overlapping appointments for the provider
        const appointmentDate = new Date(dto.appointmentDate);
        const durationMinutes = dto.durationMinutes || 30;
        const endTime = new Date(
            appointmentDate.getTime() + durationMinutes * 60 * 1000,
        );

        const overlapping = await this.prisma.appointment.findFirst({
            where: {
                providerId: dto.providerId,
                status: AppointmentStatus.SCHEDULED,
                appointmentDate: {
                    lt: endTime,
                },
                AND: {
                    appointmentDate: {
                        gte: new Date(
                            appointmentDate.getTime() - durationMinutes * 60 * 1000,
                        ),
                    },
                },
            },
        });

        if (overlapping) {
            throw new BadRequestException(
                'This time slot conflicts with an existing appointment for this provider',
            );
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

    async findAll(params: {
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
    }) {
        const { page = 1, limit = 20, status, providerId, patientId, dateFrom, dateTo, hospitalId, sortBy = 'appointmentDate', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (hospitalId) where.hospitalId = hospitalId;
        if (status) where.status = status;
        if (providerId) where.providerId = providerId;
        if (patientId) where.patientId = patientId;
        if (dateFrom || dateTo) {
            where.appointmentDate = {};
            if (dateFrom) where.appointmentDate.gte = new Date(dateFrom);
            if (dateTo) where.appointmentDate.lte = new Date(dateTo);
        }

        const [appointments, total] = await Promise.all([
            this.prisma.appointment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
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

    async findOne(id: string, hospitalId?: string) {
        const where: any = { id };
        if (hospitalId) where.hospitalId = hospitalId;

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
            throw new NotFoundException(`Appointment with ID "${id}" not found`);
        }

        return appointment;
    }

    async update(id: string, dto: UpdateAppointmentDto, hospitalId?: string) {
        const appointment = await this.findOne(id, hospitalId);

        if (appointment.status === AppointmentStatus.CANCELLED) {
            throw new BadRequestException('Cannot update a cancelled appointment');
        }

        const updateData: any = { ...dto };
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

    async cancel(id: string, hospitalId?: string) {
        const appointment = await this.findOne(id, hospitalId);

        if (appointment.status === AppointmentStatus.CANCELLED) {
            throw new BadRequestException('Appointment is already cancelled');
        }

        if (appointment.status === AppointmentStatus.COMPLETED) {
            throw new BadRequestException('Cannot cancel a completed appointment');
        }

        return this.prisma.appointment.update({
            where: { id },
            data: { status: AppointmentStatus.CANCELLED },
        });
    }
}
