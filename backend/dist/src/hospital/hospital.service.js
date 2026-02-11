"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let HospitalService = class HospitalService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const { adminEmail, adminPassword, adminFirstName, adminLastName, ...hospitalData } = dto;
        if (adminEmail && adminPassword) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: adminEmail },
            });
            if (existingUser) {
                throw new common_1.ConflictException(`A user with email "${adminEmail}" already exists`);
            }
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            return this.prisma.$transaction(async (tx) => {
                const hospital = await tx.hospital.create({ data: hospitalData });
                const admin = await tx.user.create({
                    data: {
                        email: adminEmail,
                        password: hashedPassword,
                        firstName: adminFirstName || 'Admin',
                        lastName: adminLastName || hospital.name,
                        role: client_1.Role.ADMIN,
                        hospitalId: hospital.id,
                    },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                });
                return { ...hospital, admin };
            });
        }
        return this.prisma.hospital.create({ data: hospitalData });
    }
    async findAll(params) {
        const { page = 1, limit = 20, search } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { branch: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { managerName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [hospitals, total] = await Promise.all([
            this.prisma.hospital.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { users: true, patients: true } },
                },
            }),
            this.prisma.hospital.count({ where }),
        ]);
        return {
            data: hospitals,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        return this.prisma.hospital.findUnique({
            where: { id },
            include: {
                _count: { select: { users: true, patients: true, appointments: true, invoices: true } },
            },
        });
    }
    async update(id, dto) {
        return this.prisma.hospital.update({ where: { id }, data: dto });
    }
    async remove(id) {
        return this.prisma.hospital.delete({ where: { id } });
    }
};
exports.HospitalService = HospitalService;
exports.HospitalService = HospitalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HospitalService);
//# sourceMappingURL=hospital.service.js.map