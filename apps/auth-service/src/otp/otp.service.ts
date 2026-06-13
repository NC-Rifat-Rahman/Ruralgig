import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { OtpRepository } from './otp.repository';
import { OtpType } from './type/otp-type';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { OtpRecipient } from './interfaces/otp-recipient.interface';

@Injectable()
export class OtpService {
    constructor(private readonly otpRepository: OtpRepository) { }

    async generateOtp(recipient: OtpRecipient, type: OtpType): Promise<string> {
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await this.otpRepository.create({
            userId: recipient.userId,
            token: hashedOtp,
            type,
            expiresAt,
        });

        return otp;
    }

    // async verifyOtp(userId: number, plainOtp: string, type: OtpType): Promise<boolean> {
    //     const otpRecord = await this.otpRepository.findLatestByUserAndType(userId, type);

    //     if (!otpRecord) {
    //         return false;
    //     }

    //     if (otpRecord.expiresAt < new Date()) {
    //         return false;
    //     }

    //     const isMatch = await bcrypt.compare(plainOtp, otpRecord.token);
    //     if (isMatch) {
    //         // Optional: delete used OTP
    //         await this.otpRepository.delete(otpRecord.id);
    //     }

    //     return isMatch;
    // }
}