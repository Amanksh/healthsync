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
exports.WardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let WardService = class WardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWard(dto, hospitalId) {
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
    async findAllWards(hospitalId) {
        const where = {};
        if (hospitalId)
            where.hospitalId = hospitalId;
        const wards = await this.prisma.ward.findMany({
            where,
            include: {
                beds: {
                    include: {
                        admissions: {
                            where: { status: client_1.AdmissionStatus.ADMITTED },
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
        return wards.map((ward) => ({
            ...ward,
            beds: ward.beds.map((bed) => ({
                ...bed,
                currentAdmission: bed.admissions[0] || null,
                admissions: undefined,
            })),
        }));
    }
    async findWardById(id, hospitalId) {
        const where = { id };
        if (hospitalId)
            where.hospitalId = hospitalId;
        const ward = await this.prisma.ward.findFirst({
            where,
            include: {
                beds: {
                    include: {
                        admissions: {
                            where: { status: client_1.AdmissionStatus.ADMITTED },
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
            throw new common_1.NotFoundException(`Ward with ID "${id}" not found`);
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
    async updateWard(id, dto, hospitalId) {
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
    async deleteWard(id, hospitalId) {
        await this.findWardById(id, hospitalId);
        const activeAdmissions = await this.prisma.admission.count({
            where: {
                bed: { wardId: id },
                status: client_1.AdmissionStatus.ADMITTED,
            },
        });
        if (activeAdmissions > 0) {
            throw new common_1.BadRequestException(`Cannot delete ward: ${activeAdmissions} active admission(s) exist. Discharge all patients first.`);
        }
        return this.prisma.ward.delete({ where: { id } });
    }
    async addBeds(wardId, dto, hospitalId) {
        await this.findWardById(wardId, hospitalId);
        const data = dto.beds.map((bed) => ({
            bedNumber: bed.bedNumber,
            status: bed.status || client_1.BedStatus.AVAILABLE,
            notes: bed.notes,
            wardId,
        }));
        await this.prisma.bed.createMany({ data });
        return this.findWardById(wardId, hospitalId);
    }
    async updateBed(wardId, bedId, dto, hospitalId) {
        await this.findWardById(wardId, hospitalId);
        const bed = await this.prisma.bed.findFirst({
            where: { id: bedId, wardId },
        });
        if (!bed) {
            throw new common_1.NotFoundException(`Bed "${bedId}" not found in ward "${wardId}"`);
        }
        return this.prisma.bed.update({
            where: { id: bedId },
            data: dto,
        });
    }
    async deleteBed(wardId, bedId, hospitalId) {
        await this.findWardById(wardId, hospitalId);
        const bed = await this.prisma.bed.findFirst({
            where: { id: bedId, wardId },
            include: {
                admissions: { where: { status: client_1.AdmissionStatus.ADMITTED } },
            },
        });
        if (!bed) {
            throw new common_1.NotFoundException(`Bed "${bedId}" not found in ward "${wardId}"`);
        }
        if (bed.admissions.length > 0) {
            throw new common_1.BadRequestException('Cannot delete bed with an active admission. Discharge the patient first.');
        }
        return this.prisma.bed.delete({ where: { id: bedId } });
    }
    async admitPatient(dto, hospitalId) {
        const bed = await this.prisma.bed.findUnique({
            where: { id: dto.bedId },
            include: { ward: true },
        });
        if (!bed) {
            throw new common_1.NotFoundException(`Bed with ID "${dto.bedId}" not found`);
        }
        if (bed.ward.hospitalId !== hospitalId) {
            throw new common_1.BadRequestException('Bed does not belong to your hospital');
        }
        if (bed.status !== client_1.BedStatus.AVAILABLE) {
            throw new common_1.BadRequestException(`Bed "${bed.bedNumber}" is not available (current status: ${bed.status})`);
        }
        const existingAdmission = await this.prisma.admission.findFirst({
            where: {
                patientId: dto.patientId,
                status: client_1.AdmissionStatus.ADMITTED,
            },
        });
        if (existingAdmission) {
            throw new common_1.ConflictException('Patient is already admitted to another bed. Discharge first.');
        }
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
                data: { status: client_1.BedStatus.OCCUPIED },
            }),
        ]);
        return admission;
    }
    async dischargePatient(admissionId, dto, hospitalId) {
        const admission = await this.prisma.admission.findFirst({
            where: {
                id: admissionId,
                status: client_1.AdmissionStatus.ADMITTED,
                ...(hospitalId && { hospitalId }),
            },
        });
        if (!admission) {
            throw new common_1.NotFoundException(`Active admission "${admissionId}" not found`);
        }
        const [updatedAdmission] = await this.prisma.$transaction([
            this.prisma.admission.update({
                where: { id: admissionId },
                data: {
                    status: client_1.AdmissionStatus.DISCHARGED,
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
                data: { status: client_1.BedStatus.AVAILABLE },
            }),
        ]);
        return updatedAdmission;
    }
    async findAllAdmissions(params) {
        const { page = 1, limit = 20, status, hospitalId } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (hospitalId)
            where.hospitalId = hospitalId;
        if (status)
            where.status = status;
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
    async findAdmissionById(id, hospitalId) {
        const where = { id };
        if (hospitalId)
            where.hospitalId = hospitalId;
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
            throw new common_1.NotFoundException(`Admission "${id}" not found`);
        }
        return admission;
    }
    async getWardSummary(hospitalId) {
        const where = {};
        if (hospitalId)
            where.hospitalId = hospitalId;
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
            const occupied = ward.beds.filter((b) => b.status === client_1.BedStatus.OCCUPIED).length;
            const available = ward.beds.filter((b) => b.status === client_1.BedStatus.AVAILABLE).length;
            const maintenance = ward.beds.filter((b) => b.status === client_1.BedStatus.MAINTENANCE).length;
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
            occupancyRate: totalBeds > 0
                ? Math.round((occupiedBeds / totalBeds) * 100)
                : 0,
            wardBreakdown,
        };
    }
};
exports.WardService = WardService;
exports.WardService = WardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WardService);
//# sourceMappingURL=ward.service.js.map