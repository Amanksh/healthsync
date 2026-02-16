import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicineDto, AddStockDto } from './dto';
export declare class PharmacyService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateMedicineDto, hospitalId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        name: string;
        description: string | null;
        category: string | null;
        unitPriceCents: number;
        genericName: string | null;
        code: string | null;
        manufacturer: string | null;
        minStock: number;
        totalStock: number;
    }>;
    findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        hospitalId: string;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hospitalId: string;
            name: string;
            description: string | null;
            category: string | null;
            unitPriceCents: number;
            genericName: string | null;
            code: string | null;
            manufacturer: string | null;
            minStock: number;
            totalStock: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, hospitalId: string): Promise<{
        batches: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hospitalId: string;
            quantity: number;
            medicineId: string;
            batchNumber: string;
            expiryDate: Date;
            costPriceCents: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        name: string;
        description: string | null;
        category: string | null;
        unitPriceCents: number;
        genericName: string | null;
        code: string | null;
        manufacturer: string | null;
        minStock: number;
        totalStock: number;
    }>;
    addStock(id: string, dto: AddStockDto, hospitalId: string): Promise<{
        batch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hospitalId: string;
            quantity: number;
            medicineId: string;
            batchNumber: string;
            expiryDate: Date;
            costPriceCents: number;
        };
        medicine: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hospitalId: string;
            name: string;
            description: string | null;
            category: string | null;
            unitPriceCents: number;
            genericName: string | null;
            code: string | null;
            manufacturer: string | null;
            minStock: number;
            totalStock: number;
        };
    }>;
    checkLowStock(hospitalId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        name: string;
        description: string | null;
        category: string | null;
        unitPriceCents: number;
        genericName: string | null;
        code: string | null;
        manufacturer: string | null;
        minStock: number;
        totalStock: number;
    }[]>;
    deductStock(id: string, quantity: number, hospitalId: string): Promise<{
        success: boolean;
        deducted: number;
        remainingStock: number;
    }>;
}
