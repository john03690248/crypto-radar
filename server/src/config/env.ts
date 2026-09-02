import dotenv from 'dotenv';
import path from 'path';

// 載入 .env 設定檔
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5001,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_please_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
};
