import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpEntity } from "./entities/otp.entity";
import { TypeOrmModule } from "@nestjs/typeorm";


@Module({
    imports: [TypeOrmModule.forFeature([OtpEntity])],
    providers: [OtpService],
    exports: [OtpService]
})

export class OtpModule { }