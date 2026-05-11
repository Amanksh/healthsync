import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateWardDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    floor?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
