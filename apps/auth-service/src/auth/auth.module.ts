
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { redisStore } from 'cache-manager-redis-store';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { OtpModule } from 'src/otp/otp.module';
import { EmailAuthStrategy } from './strategies/email-auth.strategy';
import { PhoneAuthStrategy } from './strategies/phone-auth.strategy';
import { AUTH_STRATEGIES } from './interfaces/auth-strategy.interface';
import { RefreshTokenRepository } from './refresh-token.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CacheModule.register({ store: redisStore, ttl: 60 * 60 * 24 * 7 }),
    UsersModule,
    OtpModule,
  ],
  controllers: [AuthController],
  providers: [
    EmailAuthStrategy,
    PhoneAuthStrategy,
    {
      provide: AUTH_STRATEGIES,
      useFactory: (email: EmailAuthStrategy, phone: PhoneAuthStrategy) => [email, phone],
      inject: [EmailAuthStrategy, PhoneAuthStrategy],
    },
    AuthService,
    RefreshTokenRepository,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }
