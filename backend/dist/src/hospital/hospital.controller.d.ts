import { HospitalService } from './hospital.service';
import { CreateHospitalDto, UpdateHospitalDto } from './dto/hospital.dto';
export declare class HospitalController {
    private hospitalService;
    constructor(hospitalService: HospitalService);
    create(dto: CreateHospitalDto): Promise<{
        name: string;
        branch: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        phone: string | null;
        managerName: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(page?: string, limit?: string, search?: string): Promise<{
        data: ({
            _count: {
                users: number;
                patients: number;
            };
        } & {
            name: string;
            branch: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            zipCode: string | null;
            phone: string | null;
            managerName: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
            users: number;
            patients: number;
            appointments: number;
            invoices: number;
        };
    } & {
        name: string;
        branch: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        phone: string | null;
        managerName: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    update(id: string, dto: UpdateHospitalDto): Promise<{
        name: string;
        branch: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        phone: string | null;
        managerName: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        name: string;
        branch: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        phone: string | null;
        managerName: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
