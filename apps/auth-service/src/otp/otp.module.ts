import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpEntity } from "./entities/otp.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OtpRepository } from "./otp.repository";


@Module({
    imports: [TypeOrmModule.forFeature([OtpEntity])],
    providers: [OtpService, OtpRepository],
    exports: [OtpService]
})

export class OtpModule { }