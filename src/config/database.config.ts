import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: toInt(process.env.DB_PORT, 3306),
    username: process.env.DB_USER ?? 'app',
    password: process.env.DB_PASSWORD ?? 'app',
    database: process.env.DB_NAME ?? 'ux_prueba_tecnica',
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
    // DATE se devuelve como 'YYYY-MM-DD' para evitar desfases por zona horaria.
    dateStrings: ['DATE'],
    autoLoadEntities: true,
    // El esquema lo gobierna database/init.sql; TypeORM nunca lo modifica.
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
  }),
);
