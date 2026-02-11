import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHospitalDto, UpdateHospitalDto } from './dto/hospital.dto';

@Injectable()
export class HospitalService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateHospitalDto) {
        const { adminEmail, adminPassword, adminFirstName, adminLastName, ...hospitalData } = dto;

        // If admin credentials provided, create both in a transaction
        if (adminEmail && adminPassword) {
            // Check if admin email already exists
            const existingUser = await this.prisma.user.findUnique({
                where: { email: adminEmail },
            });
            if (existingUser) {
                throw new ConflictException(`A user with email "${adminEmail}" already exists`);
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
                        role: Role.ADMIN,
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

    async findAll(params: { page?: number; limit?: number; search?: string }) {
        const { page = 1, limit = 20, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
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

    async findOne(id: string) {
        return this.prisma.hospital.findUnique({
            where: { id },
            include: {
                _count: { select: { users: true, patients: true, appointments: true, invoices: true } },
            },
        });
    }

    async update(id: string, dto: UpdateHospitalDto) {
        return this.prisma.hospital.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        return this.prisma.hospital.delete({ where: { id } });
    }
}
