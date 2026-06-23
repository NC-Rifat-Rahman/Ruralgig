
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { OtpService } from 'src/otp/otp.service';
import { OtpType } from 'src/otp/enums/otp-enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService
  ) { }

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.username };
    return {
      // 💡 Here the JWT secret key that's used for signing the payload 
      // is the key that was passed in the JwtModule
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    return "";
  }

  async login(dto: LoginDto) {
    try {
      const { email, password, otp } = dto;

      const user = await this.usersService.findOneByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isVerified) {
        if (!otp) {
          return {
            message: 'Account not verified. Please provide OTP for verification.',
            requiresOtp: true
          };
        }
        await this.verifyOtp(user.id, otp, OtpType.OTP);
      }

      const payload = { id: user.id, email: user.email };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken,
        userId: user.id,
        email: user.email
      };
    }
    catch (error) {
      if (error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async verifyOtp(userId: number, otp: string, otpType: OtpType) {
    await this.otpService.validateOtp(userId, otp, otpType);

    const user = await this.usersService.findOneByUserId(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isVerified = true;

    //save user
    await this.usersService.updateUser(userId, { isVerified: true });
  }

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const userId = await this.otpService.validateResetPassword(token);
    console.log("userId", userId);

    const user = await this.usersService.findOneByUserId(userId);

    console.log("user", user);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await this.usersService.updateUser(userId, { password: user.password });

    return 'Password reset successful';

  }
}
