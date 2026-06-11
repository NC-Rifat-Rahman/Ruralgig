import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from './entities/otp.entity';
import { OtpType } from './type/otp-type';

@Injectable()
export class OtpRepository {
    constructor(
        @InjectRepository(OtpEntity)
        private readonly otpRepo: Repository<OtpEntity>,
    ) { }

    async create(data: Partial<OtpEntity>) {
        const otp = this.otpRepo.create(data);
        return this.otpRepo.save(otp);
    }

    async findLatestByUserAndType(userId: number, type: OtpType) {
        return this.otpRepo.findOne({
            where: { userId, type },
            order: { createdAt: 'DESC' },
        });
    }

    // async delete(id: number) {
    //     return this.otpRepo.delete(id);
    // }
}