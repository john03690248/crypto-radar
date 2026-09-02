import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

// 🔒 安全原則：設定加鹽回合數 (Salt Rounds)，通常設為 10~12
const SALT_ROUNDS = 10;

/**
 * 🔒 密碼加鹽雜湊 (Password Hashing)
 * 絕對禁止在資料庫儲存明文密碼 (Plaintext)
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainText, salt);
}

/**
 * 🔒 密碼驗證
 * 透過 bcrypt.compare 比對明文與已加鹽雜湊值 (防止 Timing Attack 側信道攻擊)
 */
export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

/**
 * 🔒 簽發 JSON Web Token (JWT)
 */
export function generateToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}
