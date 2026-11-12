import { Module } from '@nestjs/common';
import { TaskModule } from './tasks/task.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './tasks/entity/task.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
        getTypeOrmConfig(config as any, [
          TaskEntity,
        ]) as any,
    }),
    TaskModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
