import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateWardDto,
    UpdateWardDto,
    CreateBedsDto,
    UpdateBedDto,
    AdmitPatientDto,
    DischargePatientDto,
} from './dto';
import { BedStatus, AdmissionStatus } from '@prisma/client';

@Injectable()
export class WardService {
    constructor(private prisma: PrismaService) { }

    // ─── Ward CRUD ───────────────────────────────────────────────────────────

    async createWard(dto: CreateWardDto, hospitalId: string) {
        return this.prisma.ward.create({
            data: {
                name: dto.name,
                floor: dto.floor,
                type: dto.type,
                description: dto.description,
                isActive: dto.isActive ?? true,
                hospitalId,
            },
            include: {
                beds: true,
                _count: { select: { beds: true } },
            },
        });
    }

    async findAllWards(hospitalId?: string) {
        const where: any = {};
        if (hospitalId) where.hospitalId = hospitalId;

        const wards = await this.prisma.ward.findMany({
            where,
            include: {
                beds: {
                    include: {
                        admissions: {
                            where: { status: AdmissionStatus.ADMITTED },
                            include: {
                                patient: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        mrn: true,
                                        gender: true,
                                    },
                                },
                                attendingDoctor: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                            take: 1,
                            orderBy: { admissionDate: 'desc' },
                        },
                    },
                },
                _count: { select: { beds: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Reshape: attach currentAdmission to each bed
        return wards.map((ward) => ({
            ...ward,
            beds: ward.beds.map((bed) => ({
                ...bed,
                currentAdmission: bed.admissions[0] || null,
                admissions: undefined, // remove raw array
            })),
        }));
    }

    async findWardById(id: string, hospitalId?: string) {
        const where: any = { id };
        if (hospitalId) where.hospitalId = hospitalId;

        const ward = await this.prisma.ward.findFirst({
            where,
            include: {
                beds: {
                    include: {
                        admissions: {
                            where: { status: AdmissionStatus.ADMITTED },
                            include: {
                                patient: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        mrn: true,
                                        gender: true,
                                        dateOfBirth: true,
                                        phone: true,
                                        bloodGroup: true,
                                    },
                                },
                                attendingDoctor: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                            take: 1,
                            orderBy: { admissionDate: 'desc' },
                        },
                    },
                    orderBy: { bedNumber: 'asc' },
                },
                _count: { select: { beds: true } },
            },
        });

        if (!ward) {
            throw new NotFoundException(`Ward with ID "${id}" not found`);
        }

        return {
            ...ward,
            beds: ward.beds.map((bed) => ({
                ...bed,
                currentAdmission: bed.admissions[0] || null,
                admissions: undefined,
            })),
        };
    }

    async updateWard(id: string, dto: UpdateWardDto, hospitalId?: string) {
        await this.findWardById(id, hospitalId);
        return this.prisma.ward.update({
            where: { id },
            data: dto,
            include: {
                beds: true,
                _count: { select: { beds: true } },
            },
        });
    }

    async deleteWard(id: string, hospitalId?: string) {
        await this.findWardById(id, hospitalId);
        // Cascade will delete beds; check for active admissions first
        const activeAdmissions = await this.prisma.admission.count({
            where: {
                bed: { wardId: id },
                status: AdmissionStatus.ADMITTED,
            },
        });

        if (activeAdmissions > 0) {
            throw new BadRequestException(
                `Cannot delete ward: ${activeAdmissions} active admission(s) exist. Discharge all patients first.`,
            );
        }

        return this.prisma.ward.delete({ where: { id } });
    }

    // ─── Bed Management ──────────────────────────────────────────────────────

    async addBeds(wardId: string, dto: CreateBedsDto, hospitalId?: string) {
        await this.findWardById(wardId, hospitalId);

        const data = dto.beds.map((bed) => ({
            bedNumber: bed.bedNumber,
            status: bed.status || BedStatus.AVAILABLE,
            notes: bed.notes,
            wardId,
        }));

        await this.prisma.bed.createMany({ data });

        return this.findWardById(wardId, hospitalId);
    }

    async updateBed(
        wardId: string,
        bedId: string,
        dto: UpdateBedDto,
        hospitalId?: string,
    ) {
        await this.findWardById(wardId, hospitalId);

        const bed = await this.prisma.bed.findFirst({
            where: { id: bedId, wardId },
        });

        if (!bed) {
            throw new NotFoundException(
                `Bed "${bedId}" not found in ward "${wardId}"`,
            );
        }

        return this.prisma.bed.update({
            where: { id: bedId },
            data: dto,
        });
    }

    async deleteBed(wardId: string, bedId: string, hospitalId?: string) {
        await this.findWardById(wardId, hospitalId);

        const bed = await this.prisma.bed.findFirst({
            where: { id: bedId, wardId },
            include: {
                admissions: { where: { status: AdmissionStatus.ADMITTED } },
            },
        });

        if (!bed) {
            throw new NotFoundException(
                `Bed "${bedId}" not found in ward "${wardId}"`,
            );
        }

        if (bed.admissions.length > 0) {
            throw new BadRequestException(
                'Cannot delete bed with an active admission. Discharge the patient first.',
            );
        }

        return this.prisma.bed.delete({ where: { id: bedId } });
    }

    // ─── Admission / Discharge ───────────────────────────────────────────────

    async admitPatient(dto: AdmitPatientDto, hospitalId: string) {
        // Verify bed exists and is available
        const bed = await this.prisma.bed.findUnique({
            where: { id: dto.bedId },
            include: { ward: true },
        });

        if (!bed) {
            throw new NotFoundException(`Bed with ID "${dto.bedId}" not found`);
        }

        if (bed.ward.hospitalId !== hospitalId) {
            throw new BadRequestException('Bed does not belong to your hospital');
        }

        if (bed.status !== BedStatus.AVAILABLE) {
            throw new BadRequestException(
                `Bed "${bed.bedNumber}" is not available (current status: ${bed.status})`,
            );
        }

        // Check patient isn't already admitted somewhere
        const existingAdmission = await this.prisma.admission.findFirst({
            where: {
                patientId: dto.patientId,
                status: AdmissionStatus.ADMITTED,
            },
        });

        if (existingAdmission) {
            throw new ConflictException(
                'Patient is already admitted to another bed. Discharge first.',
            );
        }

        // Create admission + mark bed as occupied in a transaction
        const [admission] = await this.prisma.$transaction([
            this.prisma.admission.create({
                data: {
                    patientId: dto.patientId,
                    bedId: dto.bedId,
                    hospitalId,
                    admissionDate: dto.admissionDate
                        ? new Date(dto.admissionDate)
                        : new Date(),
                    diagnosis: dto.diagnosis,
                    notes: dto.notes,
                    attendingDoctorId: dto.attendingDoctorId,
                },
                include: {
                    patient: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            mrn: true,
                            gender: true,
                        },
                    },
                    bed: {
                        select: { id: true, bedNumber: true },
                    },
                    attendingDoctor: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            }),
            this.prisma.bed.update({
                where: { id: dto.bedId },
                data: { status: BedStatus.OCCUPIED },
            }),
        ]);

        return admission;
    }

    async dischargePatient(
        admissionId: string,
        dto: DischargePatientDto,
        hospitalId?: string,
    ) {
        const admission = await this.prisma.admission.findFirst({
            where: {
                id: admissionId,
                status: AdmissionStatus.ADMITTED,
                ...(hospitalId && { hospitalId }),
            },
        });

        if (!admission) {
            throw new NotFoundException(
                `Active admission "${admissionId}" not found`,
            );
        }

        const [updatedAdmission] = await this.prisma.$transaction([
            this.prisma.admission.update({
                where: { id: admissionId },
                data: {
                    status: AdmissionStatus.DISCHARGED,
                    dischargeDate: dto.dischargeDate
                        ? new Date(dto.dischargeDate)
                        : new Date(),
                    notes: dto.notes || admission.notes,
                },
                include: {
                    patient: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            mrn: true,
                            gender: true,
                        },
                    },
                    bed: {
                        select: { id: true, bedNumber: true },
                    },
                    attendingDoctor: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            }),
            this.prisma.bed.update({
                where: { id: admission.bedId },
                data: { status: BedStatus.AVAILABLE },
            }),
        ]);

        return updatedAdmission;
    }

    async findAllAdmissions(params: {
        page?: number;
        limit?: number;
        status?: AdmissionStatus;
        hospitalId?: string;
    }) {
        const { page = 1, limit = 20, status, hospitalId } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (hospitalId) where.hospitalId = hospitalId;
        if (status) where.status = status;

        const [admissions, total] = await Promise.all([
            this.prisma.admission.findMany({
                where,
                skip,
                take: limit,
                orderBy: { admissionDate: 'desc' },
                include: {
                    patient: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            mrn: true,
                            gender: true,
                        },
                    },
                    bed: {
                        select: {
                            id: true,
                            bedNumber: true,
                            ward: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                    attendingDoctor: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            }),
            this.prisma.admission.count({ where }),
        ]);

        return {
            data: admissions,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findAdmissionById(id: string, hospitalId?: string) {
        const where: any = { id };
        if (hospitalId) where.hospitalId = hospitalId;

        const admission = await this.prisma.admission.findFirst({
            where,
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        mrn: true,
                        gender: true,
                        dateOfBirth: true,
                        phone: true,
                        bloodGroup: true,
                        allergies: true,
                    },
                },
                bed: {
                    select: {
                        id: true,
                        bedNumber: true,
                        ward: { select: { id: true, name: true, floor: true } },
                    },
                },
                attendingDoctor: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        if (!admission) {
            throw new NotFoundException(`Admission "${id}" not found`);
        }

        return admission;
    }

    // ─── Summary / Dashboard Stats ───────────────────────────────────────────

    async getWardSummary(hospitalId?: string) {
        const where: any = {};
        if (hospitalId) where.hospitalId = hospitalId;

        const wards = await this.prisma.ward.findMany({
            where,
            include: {
                beds: {
                    select: { id: true, status: true },
                },
            },
        });

        let totalBeds = 0;
        let occupiedBeds = 0;
        let availableBeds = 0;
        let maintenanceBeds = 0;

        const wardBreakdown = wards.map((ward) => {
            const total = ward.beds.length;
            const occupied = ward.beds.filter(
                (b) => b.status === BedStatus.OCCUPIED,
            ).length;
            const available = ward.beds.filter(
                (b) => b.status === BedStatus.AVAILABLE,
            ).length;
            const maintenance = ward.beds.filter(
                (b) => b.status === BedStatus.MAINTENANCE,
            ).length;

            totalBeds += total;
            occupiedBeds += occupied;
            availableBeds += available;
            maintenanceBeds += maintenance;

            return {
                wardId: ward.id,
                wardName: ward.name,
                floor: ward.floor,
                type: ward.type,
                total,
                occupied,
                available,
                maintenance,
            };
        });

        return {
            totalWards: wards.length,
            totalBeds,
            occupiedBeds,
            availableBeds,
            maintenanceBeds,
            occupancyRate:
                totalBeds > 0
                    ? Math.round((occupiedBeds / totalBeds) * 100)
                    : 0,
            wardBreakdown,
        };
    }
}
