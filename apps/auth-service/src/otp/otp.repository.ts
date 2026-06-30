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

    async countRecentByUser(
        userId: number,
        type: OtpType,
        windowMinutes: number,
    ): Promise<number> {
        const since = new Date(Date.now() - windowMinutes * 60 * 1000);
        return this.otpRepository.count({
            where: {
                userId,
                type,
                createdAt: MoreThan(since),
            },
        });
    }

    async deleteById(id: number): Promise<void> {
        await this.otpRepository.delete(id);
    }
}