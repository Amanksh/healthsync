import { Gender } from '@prisma/client';
declare class EmergencyContactDto {
    name: string;
    relationship: string;
    phone: string;
}
export declare class CreatePatientDto {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyContact?: EmergencyContactDto;
    bloodGroup?: string;
    allergies?: string;
}
export {};
