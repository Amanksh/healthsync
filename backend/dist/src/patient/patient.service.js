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
exports.PatientService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let PatientService = class PatientService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateMRN() {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = (0, crypto_1.randomBytes)(2).toString('hex').toUpperCase();
        return `MRN-${datePart}-${randomPart}`;
    }
    async create(dto, hospitalId) {
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
                    ? dto.emergencyContact
                    : undefined,
                bloodGroup: dto.bloodGroup,
                allergies: dto.allergies,
                hospitalId,
            },
        });
    }
    async findAll(params) {
        const { page = 1, limit = 20, search, hospitalId } = params;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
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
    async findOne(id, hospitalId) {
        const where = { id, deletedAt: null };
        if (hospitalId)
            where.hospitalId = hospitalId;
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
            throw new common_1.NotFoundException(`Patient with ID "${id}" not found`);
        }
        return patient;
    }
    async update(id, dto, hospitalId) {
        await this.findOne(id, hospitalId);
        const updateData = { ...dto };
        if (dto.dateOfBirth) {
            updateData.dateOfBirth = new Date(dto.dateOfBirth);
        }
        if (dto.emergencyContact) {
            updateData.emergencyContact = dto.emergencyContact;
        }
        return this.prisma.patient.update({
            where: { id },
            data: updateData,
        });
    }
    async softDelete(id, hospitalId) {
        await this.findOne(id, hospitalId);
        return this.prisma.patient.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.PatientService = PatientService;
exports.PatientService = PatientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatientService);
//# sourceMappingURL=patient.service.js.map