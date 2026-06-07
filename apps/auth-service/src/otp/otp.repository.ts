import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { OtpEntity } from "./entities/otp.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "src/users/dto/create-user.dto";

@Injectable()
export class OtpRepository {
    constructor(
        @InjectRepository(OtpEntity)
        private readonly otp: Repository<OtpEntity>) { }

    // TODO: Change dto
    async create(dto: any): Promise<string> {
        return "";
        // const user = this.users.create({ ...dto, password: hashedPassword });
        // save
        // return this.users.save(user);
    }
}