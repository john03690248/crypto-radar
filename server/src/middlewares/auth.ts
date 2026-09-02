import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

// 擴充 Express Request 介面以攜帶已驗證的使用者資訊
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * 🔒 資安防護：身分驗證中介層 (Authentication Middleware)
 * 驗證 Authorization Header 中的 Bearer JWT Token
 * 只有通過驗證的請求才能存取私人資源
 */
export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: '未授權：請先登入以取得存取權限。',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({
      success: false,
      message: '憑證無效或已過期，請重新登入。',
    });
  }
};
