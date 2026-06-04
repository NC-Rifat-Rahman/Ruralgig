import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule } from './mailer/mailer.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/users.entity';
import { getTypeOrmConfig } from '@ruralgig/shared-db';

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
        getTypeOrmConfig(config, [UserEntity]),
    }),
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }