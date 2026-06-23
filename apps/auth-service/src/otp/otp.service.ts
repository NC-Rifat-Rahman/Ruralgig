import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { OtpRepository } from './otp.repository';
import { OtpType } from './enums/otp-enum';
import { OtpRecipient } from './interfaces/otp-recipient.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
    constructor(
        private readonly otpRepository: OtpRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async generateOtp(recipient: OtpRecipient, type: OtpType): Promise<any> {
        if (type === OtpType.OTP) {
            const otp = crypto.randomInt(100000, 999999).toString();
            const hashedOtp = await bcrypt.hash(otp, 10);

            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            const existingOtp = await this.otpRepository.findOne(recipient.userId, type);

            if (existingOtp) {
                existingOtp.token = hashedOtp;
                existingOtp.expiresAt = expiresAt;
                await this.otpRepository.create(existingOtp);
            }
            else {
                await this.otpRepository.create({
                    userId: recipient.userId,
                    token: hashedOtp,
                    type,
                    expiresAt,
                });
            }
            return otp;
        }
        else if (type === OtpType.RESET_LINK) {
            const resetOtp = this.jwtService.sign({
                id: recipient.userId,
                email: recipient.email,
            }, {
                secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET'),
                expiresIn: '15m',
            })
            return resetOtp;
        }
    }

    async validateOtp(userId: number, plainOtp: string, type: OtpType): Promise<boolean> {
        const validToken = await this.otpRepository.findOne(userId, type);

        if (!validToken) {
            throw new BadRequestException('No valid OTP found or OTP has expired');
        }

        const isMatch = await bcrypt.compare(plainOtp, validToken.token);

        if (!isMatch) {
            throw new BadRequestException('Invalid OTP');
        }
        return true;
    }

    async validateResetPassword(token: string): Promise<any> {
        try {
            const decoded = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET'),
            });
            return decoded.id;
        }
        catch (error: any) {
            if (error?.name === 'TokenExpiredError') {
                throw new BadRequestException('Reset token has expired');
            }
            throw new BadRequestException('Invalid or expired reset token');
        }
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