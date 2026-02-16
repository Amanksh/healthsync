import { PharmacyService } from './pharmacy.service';
import { CreateMedicineDto, AddStockDto } from './dto';
export declare class PharmacyController {
    private pharmacyService;
    constructor(pharmacyService: PharmacyService);
    create(dto: CreateMedicineDto, req: any): Promise<{
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
    findAll(page?: string, limit?: string, search?: string, req?: any): Promise<{
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
    getLowStock(req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    addStock(id: string, dto: AddStockDto, req: any): Promise<{
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
}
