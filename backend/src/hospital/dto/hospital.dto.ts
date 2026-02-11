import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail, MinLength } from 'class-validator';

export class CreateHospitalDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    branch?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    zipCode?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    managerName?: string;

    // Optional admin account — created alongside the hospital
    @IsEmail()
    @IsOptional()
    adminEmail?: string;

    @IsString()
    @MinLength(8)
    @IsOptional()
    adminPassword?: string;

    @IsString()
    @IsOptional()
    adminFirstName?: string;

    @IsString()
    @IsOptional()
    adminLastName?: string;
}

export class UpdateHospitalDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    branch?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    zipCode?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    managerName?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
