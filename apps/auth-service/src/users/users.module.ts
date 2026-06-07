
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserEntity } from './entities/users.entity';
import { UsersController } from './users.controller';
import { OtpModule } from 'src/otp/otp.module';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    OtpModule,
    MailerModule
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})

export class UsersModule { }
