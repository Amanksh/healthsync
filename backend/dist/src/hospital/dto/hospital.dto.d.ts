export declare class CreateHospitalDto {
    name: string;
    branch?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    managerName?: string;
    adminEmail?: string;
    adminPassword?: string;
    adminFirstName?: string;
    adminLastName?: string;
}
export declare class UpdateHospitalDto {
    name?: string;
    branch?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    managerName?: string;
    isActive?: boolean;
}
