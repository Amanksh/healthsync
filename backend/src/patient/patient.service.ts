import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class PatientService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate a unique Medical Record Number (MRN).
     * Format: MRN-YYYYMMDD-XXXX (e.g., MRN-20260211-A3F2)
     */
    private generateMRN(): string {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = randomBytes(2).toString('hex').toUpperCase();
        return `MRN-${datePart}-${randomPart}`;
    }

    async create(dto: CreatePatientDto, hospitalId: string) {
        const mrn = this.generateMRN();

        return this.prisma.patient.create({
            data: {
                mrn,
                firstName: dto.firstName,
                lastName: dto.lastName,
                dateOfBirth: new Date(dto.dateOfBirth),
                gender: dto.gender,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
                city: dto.city,
                state: dto.state,
                zipCode: dto.zipCode,
                emergencyContact: dto.emergencyContact
                    ? (dto.emergencyContact as any)
                    : undefined,
                bloodGroup: dto.bloodGroup,
                allergies: dto.allergies,
                hospitalId,
            },
        });
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        hospitalId?: string;
    }) {
        const { page = 1, limit = 20, search, hospitalId } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            deletedAt: null, // Exclude soft-deleted
        };

        // Scope by hospital (SUPER_ADMIN passes no hospitalId to see all)
        if (hospitalId) {
            where.hospitalId = hospitalId;
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { mrn: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }

        const [patients, total] = await Promise.all([
            this.prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.patient.count({ where }),
        ]);

        return {
            data: patients,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, hospitalId?: string) {
        const where: any = { id, deletedAt: null };
        if (hospitalId) where.hospitalId = hospitalId;

        const patient = await this.prisma.patient.findFirst({
            where,
            include: {
                appointments: {
                    orderBy: { appointmentDate: 'desc' },
                    take: 10,
                    include: {
                        provider: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                },
                invoices: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!patient) {
            throw new NotFoundException(`Patient with ID "${id}" not found`);
        }

        return patient;
    }

    async update(id: string, dto: UpdatePatientDto, hospitalId?: string) {
        await this.findOne(id, hospitalId);

        const updateData: any = { ...dto };
        if (dto.dateOfBirth) {
            updateData.dateOfBirth = new Date(dto.dateOfBirth);
        }
        if (dto.emergencyContact) {
            updateData.emergencyContact = dto.emergencyContact as any;
        }

        return this.prisma.patient.update({
            where: { id },
            data: updateData,
        });
    }

    async softDelete(id: string, hospitalId?: string) {
        await this.findOne(id, hospitalId);

        return this.prisma.patient.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
