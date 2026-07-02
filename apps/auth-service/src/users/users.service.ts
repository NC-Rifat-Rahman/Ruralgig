import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { OtpType } from 'src/otp/enums/otp-enum';
import { OtpService } from 'src/otp/otp.service';
import { MailerService } from 'src/mailer/mailer.service';
import { OtpRecipient } from 'src/otp/interfaces/otp-recipient.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly otpService: OtpService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    async register(dto: CreateUserDto) {
        const existingUser = await this.usersRepository.findOneByEmailOrUsername(dto.email, dto.username);
        if (existingUser) {
            throw new BadRequestException('User with this email or username already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        const newUser = await this.usersRepository.create(dto, hashedPassword);

        const recepient = {
            userId: newUser.id,
            email: newUser.email,
        };

        await this.emailVerification(recepient, OtpType.OTP);

        return {
            message: 'Registration successful. Please verify your email.',
            userId: newUser.id,
            email: newUser.email,
        };
    }

    async emailVerification(recepient: OtpRecipient, otpType: OtpType) {
        const plainOtp = await this.otpService.generateOtp(recepient, otpType);
        console.log(`[EMAIL] OTP for ${recepient.email}: ${plainOtp}`);

        if (otpType === OtpType.OTP) {
            const emailDto = {
                recipients: [recepient.email],
                subject: 'OTP for Email Verification',
                html: `<p>Your OTP is: <strong>${plainOtp}</strong></p>`,
            }
            return await this.mailerService.sendEmail(emailDto);
        }
        else if (otpType === OtpType.RESET_LINK) {
            const resetLink = `${this.configService.get<string>('RESET_PASSWORD_URL')}?token=${plainOtp}`;

            const emailDto = {
                recipients: [recepient.email],
                subject: 'Password Reset Link',
                html: `<p>Your reset link is: <strong>${resetLink}</strong></p>`,
            }
            return await this.mailerService.sendEmail(emailDto);
        }
    }

    async updateUser(userId: number, updateData: Partial<UpdateUserDto>) {
        return this.usersRepository.update(userId, updateData);
    }

    async findOneByEmail(email: string) {
        return this.usersRepository.findOneByEmail(email);
    }

    async findOneByUserId(userId: number) {
        return this.usersRepository.findOneByUserId(userId);
    }
}