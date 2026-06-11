import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyOtpDto } from 'src/otp/dto/verify-otp.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    async register(@Body() dto: CreateUserDto) {
        return this.usersService.register(dto);
    }

    // @Post('verify-otp')
    // @HttpCode(HttpStatus.OK)
    // async verifyOtp(@Body() dto: VerifyOtpDto) {
    //     return this.usersService.verifyOtp(dto);
    // }
}