import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { OtpRepository } from './otp.repository';
import { OtpType } from './enums/otp-enum';
import { OtpRecipient } from './interfaces/otp-recipient.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const OTP_RATE_LIMIT = 5;
const OTP_RATE_WINDOW_MINUTES = 60;

@Injectable()
export class OtpService {
    constructor(
        private readonly otpRepository: OtpRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async generateOtp(recipient: OtpRecipient, type: OtpType): Promise<any> {
        if (type === OtpType.OTP) {
            const recentCount = await this.otpRepository.countRecentByUser(
                recipient.userId,
                type,
                OTP_RATE_WINDOW_MINUTES,
            );
            if (recentCount >= OTP_RATE_LIMIT) {
                throw new BadRequestException(`OTP limit reached. You can request at 
                    most ${OTP_RATE_LIMIT} OTPs per hour. Please try again later.`)
            }
        }

        if (type === OtpType.OTP) {
            const otp = crypto.randomInt(100000, 999999).toString();
            const hashedOtp = await bcrypt.hash(otp, 10);
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            const existing = await this.otpRepository.findOne(recipient.userId, type);

            if (existing) {
                existing.token = hashedOtp;
                existing.expiresAt = expiresAt;
                await this.otpRepository.create(existing);
            } else {
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
        const record = await this.otpRepository.findOne(userId, type);

        if (!record) {
            throw new BadRequestException('No valid OTP found or OTP has expired');
        }

        const isMatch = await bcrypt.compare(plainOtp, record.token);
        if (!isMatch) {
            throw new BadRequestException('Invalid OTP');
        }

        // Consume the OTP immediately — prevents replay within the 5-minute window.
        await this.otpRepository.deleteById(record.id);

        return true;
    }

    async validateResetPassword(token: string): Promise<number> {
        try {
            const decoded = this.jwtService.verify<{ id: number; email: string }>(token, {
                secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET'),
            });
            return decoded.id;
        } catch (error: any) {
            if (error?.name === 'TokenExpiredError') {
                throw new BadRequestException('Reset token has expired');
            }
            throw new BadRequestException('Invalid or expired reset token');
        }
    }
}