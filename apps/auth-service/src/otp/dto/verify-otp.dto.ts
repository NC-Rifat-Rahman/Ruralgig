import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    otp: string;
}