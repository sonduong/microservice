/* istanbul ignore file */
import * as dotenv from 'dotenv';

dotenv.config();
const dbConfig = {
  type: 'mariadb',
  host: process.env.MARIA_HOST || 'localhost',
  port: Number(process.env.MARIA_PORT || 3306),
  username: process.env.MARIA_USERNAME,
  password: process.env.MARIA_PASSWORD,
  database: process.env.MARIA_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: true,
  logging: process.env.NODE_ENV !== 'production',
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export = dbConfig;
