import { IsBoolean, IsDate, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsEmail()
    email?: string;

    @IsString()
    @MinLength(3)
    username?: string;

    @IsString()
    @MinLength(6)
    password?: string;

    @IsEnum(['WORKER', 'BUSINESS', 'ADMIN'])
    @IsOptional()
    role?: 'WORKER' | 'BUSINESS' | 'ADMIN';

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsString()
    phone?: string;

    @IsBoolean()
    isVerified?: boolean;

    @IsDate()
    createdAt?: Date;

    @IsDate()
    updatedAt?: Date;
}