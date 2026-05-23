import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (
  config: ConfigService,
  entities: Function[],
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host:     config.get<string>('DB_HOST', 'localhost'),
  port:     config.get<number>('DB_PORT', 5432),
  username: config.get<string>('DB_USER', 'postgres'),
  password: config.get<string>('DB_PASSWORD', 'ruralgig'),
  database: config.get<string>('DB_NAME', 'ruralgig'),
  entities,
  synchronize: config.get('NODE_ENV') !== 'production', // NEVER true in prod
  logging: config.get('NODE_ENV') === 'development',
  ssl: config.get('NODE_ENV') === 'production'
    ? { rejectUnauthorized: false }
    : false,
});