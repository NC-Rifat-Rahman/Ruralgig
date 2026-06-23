import { Injectable } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from './entities/otp.entity';
import { OtpType } from './enums/otp-enum';

@Injectable()
export class OtpRepository {
    constructor(
        @InjectRepository(OtpEntity)
        private readonly otpRepository: Repository<OtpEntity>,
    ) { }

    async create(data: Partial<OtpEntity>) {
        const otp = this.otpRepository.create(data);
        return this.otpRepository.save(otp);
    }

    async findLatestByUserAndType(userId: number, type: OtpType) {
        return this.otpRepository.findOne({
            where: { userId, type },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(userId: number, type: OtpType) {
        const validToken = await this.otpRepository.findOne({
            where: {
                userId,
                type,
                expiresAt: MoreThan(new Date())
            },
        });
        return validToken;
    }

    // async delete(id: number) {
    //     return this.otpRepository.delete(id);
    // }
}