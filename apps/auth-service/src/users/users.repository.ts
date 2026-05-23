import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersRepository {
    constructor(private readonly users: Repository<User>) { }

    async findOne(dto: CreateUserDto): Promise<User | undefined> {
        return "";
        // return this.users.find(user => user.username === username);
    }

    async create(dto: CreateUserDto, hashedPassword: string): Promise<User> {
        return "";
        // const user = this.users.create({ ...dto, password: hashedPassword });
        // save
        // return this.users.save(user);
    }
}