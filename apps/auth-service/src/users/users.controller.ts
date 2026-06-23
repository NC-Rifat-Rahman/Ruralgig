import { Body, Controller, Post, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { OtpType } from 'src/otp/enums/otp-enum';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    async register(@Body() dto: CreateUserDto) {
        return this.usersService.register(dto);
    }

    @Post('request-otp')
    async requestOtp(@Body() dto: RequestOtpDto) {
        const user = await this.usersService.findOneByEmail(dto.email);

        if (!user) {
            throw new BadRequestException('User with this email does not exist');
        }

        await this.usersService.emailVerification({ userId: user.id, email: user.email }, OtpType.OTP);

        return { message: 'OTP sent to email' };
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: RequestOtpDto) {
        const user = await this.usersService.findOneByEmail(dto.email);

        if (!user) {
            throw new BadRequestException('User with this email does not exist');
        }

        await this.usersService.emailVerification({ userId: user.id, email: user.email }, OtpType.RESET_LINK);

        return { message: 'Reset link sent to email' };
    }

    // @Post('verify-otp')
    // @HttpCode(HttpStatus.OK)
    // async verifyOtp(@Body() dto: VerifyOtpDto) {
    //     return this.usersService.verifyOtp(dto);
    // }
}