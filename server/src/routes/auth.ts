import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword, generateToken } from '../services/authService';
import { validate } from '../middlewares/validate';
import { requireAuth, AuthenticatedRequest } from '../middlewares/auth';
import { authRateLimiter } from '../middlewares/rateLimiter';

export const authRouter = Router();

// 🔒 Zod 輸入規則定義
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('請輸入有效的 Email 電子信箱'),
    password: z
      .string()
      .min(6, '密碼長度至少需要 6 個字元')
      .max(64, '密碼長度不得超過 64 個字元'),
    username: z.string().min(2, '使用者名稱至少 2 個字元').max(30).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('請輸入有效的 Email 電子信箱'),
    password: z.string().min(1, '請輸入密碼'),
  }),
});

/**
 * 1. 使用者註冊 API
 * POST /api/auth/register
 */
authRouter.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const { email, password, username } = req.body;

      // 檢查 Email 是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: '該 Email 已經被註冊過，請直接登入。',
        });
        return;
      }

      // 密碼安全加鹽雜湊
      const passwordHash = await hashPassword(password);

      // 寫入 Supabase 資料庫
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          username: username || email.split('@')[0],
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
        },
      });

      // 簽發 JWT Token
      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
      });

      res.status(201).json({
        success: true,
        message: '註冊成功！',
        data: {
          user: newUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 2. 使用者登入 API
 * POST /api/auth/login
 */
authRouter.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        // 🔒 資安小細節：故意不說「帳號不存在」，避免攻擊者探測現有帳號庫
        res.status(401).json({
          success: false,
          message: '帳號或密碼錯誤。',
        });
        return;
      }

      // 驗證密碼 Hash
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: '帳號或密碼錯誤。',
        });
        return;
      }

      // 簽發 JWT Token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      res.status(200).json({
        success: true,
        message: '登入成功！',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 3. 取得目前登入者資訊 (需帶 JWT)
 * GET /api/auth/me
 */
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: '找不到此使用者。' });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});
