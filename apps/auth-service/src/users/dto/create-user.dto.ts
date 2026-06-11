import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(['WORKER', 'BUSINESS', 'ADMIN'])
    @IsOptional()
    role?: 'WORKER' | 'BUSINESS' | 'ADMIN';

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}