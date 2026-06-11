import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly users: Repository<UserEntity>,
    ) { }

    async findOneByEmailOrUsername(email: string, username: string) {
        return this.users.findOne({
            where: [{ email }, { username }],
        });
    }

    async findOneByEmail(email: string) {
        return this.users.findOne({ where: { email } });
    }

    async findOneByUsername(username: string) {
        return this.users.findOne({ where: { username } });
    }

    async create(dto: CreateUserDto, hashedPassword: string): Promise<UserEntity> {
        const user = this.users.create({
            ...dto,
            password: hashedPassword,
            role: dto.role || 'WORKER',
            isActive: dto.isActive ?? true,
        });
        return this.users.save(user);
    }

    // async markAsVerified(userId: number) {
    //     return this.users.update(userId, { isVerified: true });
    // }
}