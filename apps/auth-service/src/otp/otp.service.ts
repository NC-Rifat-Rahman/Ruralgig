import { Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs/umd/types";
import * as crypto from "crypto";
import { OtpRepository } from "./otp.repository";

@Injectable()
export class OtpService {
    constructor(
        private readonly otpRepository: OtpRepository,
    ) { }

    async generateOtp(userId: number, type: string): Promise<string> {
        // Generate a random 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // OTP expires in 5 minutes

        const otpEntity = this.otpRepository.create({
            userId,
            token: hashedOtp,
            type, // Cast to OtpType if necessary
            expiresAt,
        });

        // Save the OTP to the database 
        return otp;
    }

}