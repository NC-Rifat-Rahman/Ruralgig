import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { OtpService } from 'src/otp/otp.service';
import { OtpType } from 'src/otp/enums/otp-enum';
import { IAuthStrategy } from './interfaces/auth-strategy.interface';
import { RefreshTokenRepository } from './refresh-token.repository';
import { ConfigService } from '@nestjs/config';

const REFRESH_TOKEN_TTL_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService,
    @Inject('AUTH_STRATEGIES') private readonly strategies: IAuthStrategy[],
  ) { }

  async login(dto: LoginDto) {
    const strategy = this.strategies.find((s) => s.supports(dto));

    if (!strategy) {
      throw new BadRequestException(
        'Could not determine login method. Provide email + password or phone + otp.',
      );
    }

    const user = await strategy.validate(dto);

    if (!user.isVerified) {
      if (!dto.otp) {
        return {
          requiresOtp: true,
          message: 'Account not verified. Please provide OTP for verification.',
        };
      }
      await this.verifyOtp(user.id, dto.otp, OtpType.OTP);
    }
    return this.issueTokenPair(user.id, user.email);
  }

  async refreshToken(refreshToken: string) {
    const tokenHash = this.refreshTokenRepository.hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { id, email } = storedToken.user;

    await this.refreshTokenRepository.deleteById(storedToken.id);
    return this.issueTokenPair(id, email);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const tokenHash = this.refreshTokenRepository.hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (storedToken) {
      await this.refreshTokenRepository.deleteById(storedToken.id);
    }
    return { message: "Logged out successfully" };
  }

  async logoutAll(userId: number): Promise<{ message: string }> {
    await this.refreshTokenRepository.deleteByUserId(userId);
    return { message: "Logged out from all devices" };
  }

  async validateUser(email: string, password: string) {
    const strategy = this.strategies.find((s) => s.supports({ email, password }));

    if (!strategy) {
      throw new BadRequestException('Invalid login credentials');
    }
    return strategy.validate({ email, password });
  }

  async verifyOtp(userId: number, otp: string, otpType: OtpType) {
    await this.otpService.validateOtp(userId, otp, otpType);

    const user = await this.usersService.findOneByUserId(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.usersService.updateUser(userId, { isVerified: true });
  }

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const userId = await this.otpService.validateResetPassword(token);
    const user = await this.usersService.findOneByUserId(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.updateUser(userId, { password: hashedPassword });
    await this.refreshTokenRepository.deleteByUserId(userId);

    return 'Password reset successful';
  }

  private async issueTokenPair(userId: number, email: string) {
    const payload = { id: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
    await this.refreshTokenRepository.create(userId, refreshTokenValue, expiresAt);

    return { accessToken, refreshToken: refreshTokenValue, userId, email };
  }
}
