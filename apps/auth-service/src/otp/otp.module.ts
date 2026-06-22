import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpEntity } from "./entities/otp.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OtpRepository } from "./otp.repository";
import { JwtModule } from "@nestjs/jwt";


@Module({
    imports: [TypeOrmModule.forFeature([OtpEntity]), JwtModule],
    providers: [OtpService, OtpRepository],
    exports: [OtpService]
})

export class OtpModule { }