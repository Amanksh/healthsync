import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicineDto, AddStockDto } from './dto';

@Injectable()
export class PharmacyService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateMedicineDto, hospitalId: string) {
        // Check if medicine with same name exists for this hospital
        const existing = await this.prisma.medicine.findUnique({
            where: {
                hospitalId_name: {
                    hospitalId,
                    name: dto.name,
                },
            },
        });

        if (existing) {
            throw new BadRequestException(`Medicine "${dto.name}" already exists in this hospital`);
        }

        return this.prisma.medicine.create({
            data: {
                ...dto,
                hospitalId,
            },
        });
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        hospitalId: string;
    }) {
        const { page = 1, limit = 20, search, hospitalId } = params;
        const skip = (page - 1) * limit;

        const where: any = { hospitalId };

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

    async findOne(id: string, hospitalId: string) {
        const medicine = await this.prisma.medicine.findFirst({
            where: { id, hospitalId },
            include: {
                batches: {
                    where: { quantity: { gt: 0 } }, // Only show active batches
                    orderBy: { expiryDate: 'asc' }, // FEFO (First Expired First Out)
                },
            },
        });

        if (!medicine) {
            throw new NotFoundException(`Medicine with ID "${id}" not found`);
        }

        return medicine;
    }

    async addStock(id: string, dto: AddStockDto, hospitalId: string) {
        const medicine = await this.findOne(id, hospitalId);

        // Transaction to ensure atomicity
        return this.prisma.$transaction(async (tx) => {
            // 1. Create Batch
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

            // 2. Update Total Stock
            const updatedMedicine = await tx.medicine.update({
                where: { id },
                data: {
                    totalStock: { increment: dto.quantity },
                },
            });

            return { batch, medicine: updatedMedicine };
        });
    }

    async checkLowStock(hospitalId: string) {
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

    /**
     * Deducts stock from a medicine using FIFO (First-In-First-Out) logic.
     * Consumes oldest batches first.
     */
    async deductStock(id: string, quantity: number, hospitalId: string) {
        return this.prisma.$transaction(async (tx) => {
            const medicine = await tx.medicine.findUnique({
                where: { id },
                include: {
                    batches: {
                        where: { quantity: { gt: 0 } },
                        orderBy: { expiryDate: 'asc' }, // FIFO: Oldest expiry first
                    },
                },
            });

            if (!medicine) {
                throw new NotFoundException(`Medicine not found`);
            }

            if (medicine.totalStock < quantity) {
                throw new BadRequestException(`Insufficient stock. Available: ${medicine.totalStock}, Requested: ${quantity}`);
            }

            let remainingToDeduct = quantity;

            // Iterate through batches and deduct
            for (const batch of medicine.batches) {
                if (remainingToDeduct <= 0) break;

                const deductAmount = Math.min(batch.quantity, remainingToDeduct);

                await tx.medicineBatch.update({
                    where: { id: batch.id },
                    data: { quantity: { decrement: deductAmount } },
                });

                remainingToDeduct -= deductAmount;
            }

            // Update total stock on Medicine model
            await tx.medicine.update({
                where: { id },
                data: { totalStock: { decrement: quantity } },
            });

            return { success: true, deducted: quantity, remainingStock: medicine.totalStock - quantity };
        });
    }
}
