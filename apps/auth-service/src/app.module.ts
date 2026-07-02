import { Module } from '@nestjs/common';
import { MailerModule } from './mailer/mailer.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/users.entity';
import { getTypeOrmConfig } from '@ruralgig/shared-db';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { OtpEntity } from './otp/entities/otp.entity';
import { RefreshTokenEntity } from './auth/entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `${process.cwd()}/.env`,
        `${process.cwd()}/../../.env`,
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        getTypeOrmConfig(config, [
          UserEntity,
          OtpEntity,
          RefreshTokenEntity,
        ]),
    }),
    MailerModule,
    UsersModule,
    AuthModule,
    OtpModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }