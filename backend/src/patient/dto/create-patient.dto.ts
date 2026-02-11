import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsOptional,
    IsDateString,
    IsEnum,
    Matches,
    IsObject,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

class EmergencyContactDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    relationship: string;

    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Emergency contact phone must be a valid E.164 phone number',
    })
    phone: string;
}

export class CreatePatientDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsDateString()
    dateOfBirth: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsOptional()
    email?: string;

    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone must be a valid E.164 phone number (e.g. +919876543210)',
    })
    phone: string;

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

    @IsObject()
    @ValidateNested()
    @Type(() => EmergencyContactDto)
    @IsOptional()
    emergencyContact?: EmergencyContactDto;

    @IsString()
    @IsOptional()
    bloodGroup?: string;

    @IsString()
    @IsOptional()
    allergies?: string;
}
