import { PrismaService } from '../prisma/prisma.service';
import { CreateHospitalDto, UpdateHospitalDto } from './dto/hospital.dto';
export declare class HospitalService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateHospitalDto): Promise<{
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branch: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        managerName: string | null;
    }>;
    findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        data: ({
            _count: {
                users: number;
                patients: number;
            };
        } & {
            id: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            branch: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            zipCode: string | null;
            managerName: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<({
        _count: {
            appointments: number;
            users: number;
            patients: number;
            invoices: number;
        };
    } & {
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branch: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        managerName: string | null;
    }) | null>;
    update(id: string, dto: UpdateHospitalDto): Promise<{
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branch: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        managerName: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branch: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        managerName: string | null;
    }>;
}
