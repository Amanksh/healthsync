import { Role } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    phone?: string;
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    role?: Role;
    phone?: string;
}
