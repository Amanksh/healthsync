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
exports.PharmacyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PharmacyService = class PharmacyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, hospitalId) {
        const existing = await this.prisma.medicine.findUnique({
            where: {
                hospitalId_name: {
                    hospitalId,
                    name: dto.name,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Medicine "${dto.name}" already exists in this hospital`);
        }
        return this.prisma.medicine.create({
            data: {
                ...dto,
                hospitalId,
            },
        });
    }
    async findAll(params) {
        const { page = 1, limit = 20, search, hospitalId } = params;
        const skip = (page - 1) * limit;
        const where = { hospitalId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { genericName: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [medicines, total] = await Promise.all([
            this.prisma.medicine.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.medicine.count({ where }),
        ]);
        return {
            data: medicines,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, hospitalId) {
        const medicine = await this.prisma.medicine.findFirst({
            where: { id, hospitalId },
            include: {
                batches: {
                    where: { quantity: { gt: 0 } },
                    orderBy: { expiryDate: 'asc' },
                },
            },
        });
        if (!medicine) {
            throw new common_1.NotFoundException(`Medicine with ID "${id}" not found`);
        }
        return medicine;
    }
    async addStock(id, dto, hospitalId) {
        const medicine = await this.findOne(id, hospitalId);
        return this.prisma.$transaction(async (tx) => {
            const batch = await tx.medicineBatch.create({
                data: {
                    medicineId: id,
                    hospitalId,
                    batchNumber: dto.batchNumber,
                    expiryDate: new Date(dto.expiryDate),
                    quantity: dto.quantity,
                    costPriceCents: dto.costPriceCents,
                },
            });
            const updatedMedicine = await tx.medicine.update({
                where: { id },
                data: {
                    totalStock: { increment: dto.quantity },
                },
            });
            return { batch, medicine: updatedMedicine };
        });
    }
    async checkLowStock(hospitalId) {
        return this.prisma.medicine.findMany({
            where: {
                hospitalId,
                totalStock: {
                    lte: this.prisma.medicine.fields.minStock,
                },
            },
            orderBy: { totalStock: 'asc' },
        });
    }
};
exports.PharmacyService = PharmacyService;
exports.PharmacyService = PharmacyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PharmacyService);
//# sourceMappingURL=pharmacy.service.js.map