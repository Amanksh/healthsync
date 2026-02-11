import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateUserDto, hospitalId: string) {
        // Check for duplicate email
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('A user with this email already exists');
        }

        // Hospital ADMINs cannot create ADMIN or SUPER_ADMIN users
        if (dto.role === Role.SUPER_ADMIN) {
            throw new ForbiddenException('Cannot create a SUPER_ADMIN user');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role,
                phone: dto.phone,
                hospitalId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
            },
        });

        return { message: 'User created successfully', user };
    }

    async findAll(hospitalId: string | null, params: { page?: number; limit?: number; search?: string }) {
        const { page = 1, limit = 20, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Scope by hospital — SUPER_ADMIN (null hospitalId) sees all
        if (hospitalId) {
            where.hospitalId = hospitalId;
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Exclude SUPER_ADMIN from lists
        where.role = { not: Role.SUPER_ADMIN };

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    phone: true,
                    isActive: true,
                    createdAt: true,
                    hospital: { select: { id: true, name: true } },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async update(id: string, dto: UpdateUserDto, hospitalId: string | null) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        // ADMIN can only update users in their own hospital
        if (hospitalId && user.hospitalId !== hospitalId) {
            throw new ForbiddenException('Cannot update users from another hospital');
        }

        // Prevent changing role to SUPER_ADMIN
        if (dto.role === Role.SUPER_ADMIN) {
            throw new ForbiddenException('Cannot promote to SUPER_ADMIN');
        }

        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                isActive: true,
            },
        });
    }

    async toggleActive(id: string, hospitalId: string | null) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        if (hospitalId && user.hospitalId !== hospitalId) {
            throw new ForbiddenException('Cannot modify users from another hospital');
        }

        // Prevent deactivating SUPER_ADMIN
        if (user.role === Role.SUPER_ADMIN) {
            throw new ForbiddenException('Cannot deactivate a SUPER_ADMIN');
        }

        return this.prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
            },
        });
    }
}
