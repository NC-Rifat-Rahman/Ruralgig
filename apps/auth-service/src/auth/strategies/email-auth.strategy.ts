import { Injectable, UnauthorizedException } from "@nestjs/common";
import { IAuthStrategy, LoginCredentials } from "../interfaces/auth-strategy.interface";
import { UsersService } from "src/users/users.service";
import { UserEntity } from "src/users/entities/users.entity";
import bcrypt from "bcryptjs/umd/types";

@Injectable()
export class EmailAuthStrategy implements IAuthStrategy {
    constructor(private readonly usersService: UsersService) { }

    supports(credentials: LoginCredentials): boolean {
        return !!(credentials.email && credentials.password && !credentials.phone);
    }

    async validate(credentials: LoginCredentials): Promise<UserEntity> {
        const user = await this.usersService.findOneByEmail(credentials.email!);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password!, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }
}