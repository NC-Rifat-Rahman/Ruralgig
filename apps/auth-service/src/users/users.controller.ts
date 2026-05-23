import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    async register(dto: CreateUserDto) {
        try {
            await this.usersService.register(dto);
        } catch (error) {
            throw error;
        }
    }
}
