import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    create(dto: CreateUserDto, req: any): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    findAll(page?: string, limit?: string, search?: string, req?: any): Promise<{
        data: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            hospital: {
                id: string;
                name: string;
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    update(id: string, dto: UpdateUserDto, req: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        phone: string | null;
        isActive: boolean;
    }>;
    toggleActive(id: string, req: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
    }>;
}
